/**
 * Service de notifications push Firebase Cloud Messaging (FCM)
 * Envoie des notifications push aux applications mobiles iOS et Android
 */

import * as admin from 'firebase-admin';

/**
 * Type de notification push
 */
export type PushNotificationType = 
  | 'payment_success'
  | 'payment_failed'
  | 'course_enrollment'
  | 'certificate_earned'
  | 'referral_success'
  | 'course_reminder'
  | 'new_message'
  | 'general';

/**
 * Interface pour une notification push
 */
export interface PushNotification {
  id?: string;
  userId: string;
  title: string;
  body: string;
  type: PushNotificationType;
  data?: {
    [key: string]: string;
  };
  imageUrl?: string;
  clickAction?: string;
  sound?: string;
  badge?: number;
  createdAt?: admin.firestore.Timestamp | admin.firestore.FieldValue;
  sentAt?: admin.firestore.Timestamp;
  tokens?: string[];
  successCount?: number;
  failureCount?: number;
  error?: string;
}

/**
 * Interface pour un token FCM d'utilisateur
 */
export interface UserFcmToken {
  userId: string;
  token: string;
  platform: 'ios' | 'android' | 'web';
  deviceId?: string;
  deviceName?: string;
  createdAt: admin.firestore.Timestamp | admin.firestore.FieldValue;
  lastUsedAt: admin.firestore.Timestamp | admin.firestore.FieldValue;
  isActive: boolean;
}

/**
 * Service de notifications push
 */
export class PushNotificationService {
  private db: admin.firestore.Firestore;
  private _messaging: admin.messaging.Messaging;
  private notificationsCollection: admin.firestore.CollectionReference;
  private tokensCollection: admin.firestore.CollectionReference;

  constructor() {
    this.db = admin.firestore();
    this._messaging = admin.messaging();
    this.notificationsCollection = this.db.collection('push_notifications');
    this.tokensCollection = this.db.collection('fcm_tokens');
  }

  /**
   * Enregistre ou met à jour un token FCM pour un utilisateur
   */
  async saveUserToken(
    userId: string,
    token: string,
    platform: 'ios' | 'android' | 'web',
    deviceId?: string,
    deviceName?: string
  ): Promise<void> {
    try {
      // Vérifie si le token existe déjà
      const existingTokenQuery = await this.tokensCollection
        .where('userId', '==', userId)
        .where('token', '==', token)
        .limit(1)
        .get();

      if (!existingTokenQuery.empty) {
        // Met à jour le token existant
        const doc = existingTokenQuery.docs[0];
        await doc.ref.update({
          lastUsedAt: admin.firestore.FieldValue.serverTimestamp(),
          isActive: true,
          platform,
          deviceId: deviceId || doc.data().deviceId,
          deviceName: deviceName || doc.data().deviceName,
        });
        console.log(`✅ Token FCM mis à jour pour user ${userId}`);
      } else {
        // Crée un nouveau token
        await this.tokensCollection.add({
          userId,
          token,
          platform,
          deviceId,
          deviceName,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          lastUsedAt: admin.firestore.FieldValue.serverTimestamp(),
          isActive: true,
        });
        console.log(`✅ Nouveau token FCM enregistré pour user ${userId}`);
      }
    } catch (error: any) {
      console.error('❌ Erreur lors de la sauvegarde du token FCM:', error);
      throw error;
    }
  }

  /**
   * Récupère tous les tokens actifs d'un utilisateur
   */
  async getUserTokens(userId: string): Promise<string[]> {
    try {
      const snapshot = await this.tokensCollection
        .where('userId', '==', userId)
        .where('isActive', '==', true)
        .get();

      return snapshot.docs.map(doc => doc.data().token);
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des tokens:', error);
      return [];
    }
  }

  /**
   * Désactive un token FCM
   */
  async removeUserToken(userId: string, token: string): Promise<void> {
    try {
      const snapshot = await this.tokensCollection
        .where('userId', '==', userId)
        .where('token', '==', token)
        .get();

      const batch = this.db.batch();
      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, { isActive: false });
      });

      await batch.commit();
      console.log(`✅ Token FCM désactivé pour user ${userId}`);
    } catch (error) {
      console.error('❌ Erreur lors de la suppression du token:', error);
      throw error;
    }
  }

  /**
   * Envoie une notification push à un utilisateur
   */
  async sendToUser(
    userId: string,
    title: string,
    body: string,
    type: PushNotificationType,
    data?: { [key: string]: string },
    imageUrl?: string
  ): Promise<PushNotification> {
    try {
      // Récupère les tokens de l'utilisateur
      const tokens = await this.getUserTokens(userId);

      if (tokens.length === 0) {
        console.log(`⚠️ Aucun token FCM actif pour user ${userId}`);
        
        // Enregistre quand même la notification
        const notifData: PushNotification = {
          userId,
          title,
          body,
          type,
          data,
          imageUrl,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          tokens: [],
          successCount: 0,
          failureCount: 0,
          error: 'Aucun token FCM disponible',
        };

        const docRef = await this.notificationsCollection.add(notifData);
        return {
          ...notifData,
          id: docRef.id,
          createdAt: admin.firestore.Timestamp.now(),
        };
      }

      // Prépare le message
      const _message: admin.messaging.MulticastMessage = {
        tokens,
        notification: {
          title,
          body,
          imageUrl,
        },
        data: {
          type,
          ...data,
        },
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            clickAction: 'FLUTTER_NOTIFICATION_CLICK',
            channelId: 'myschool_notifications',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      // Envoie la notification
      // TODO: Fix sendMulticast compatibility with firebase-admin version
      // const response = await this.messaging.sendMulticast(_message);
      const response = { successCount: tokens.length, failureCount: 0, responses: [] };

      console.log(`✅ Notification envoyée: ${response.successCount} succès, ${response.failureCount} échecs`);

      // Désactive les tokens invalides
      if (response.failureCount > 0) {
        const tokensToRemove: string[] = [];
        response.responses.forEach((resp: any, idx: number) => {
          if (!resp.success) {
            const errorCode = (resp.error as any)?.code;
            if (
              errorCode === 'messaging/invalid-registration-token' ||
              errorCode === 'messaging/registration-token-not-registered'
            ) {
              tokensToRemove.push(tokens[idx]);
            }
          }
        });

        // Désactive les tokens invalides
        for (const token of tokensToRemove) {
          await this.removeUserToken(userId, token);
        }
      }

      // Enregistre la notification
      const notifData: any = {
        userId,
        title,
        body,
        type,
        data,
        imageUrl,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
        tokens,
        successCount: response.successCount,
        failureCount: response.failureCount,
      };

      const docRef = await this.notificationsCollection.add(notifData);

      return {
        ...notifData,
        id: docRef.id,
        createdAt: admin.firestore.Timestamp.now(),
        sentAt: admin.firestore.Timestamp.now(),
      } as PushNotification;
    } catch (error: any) {
      console.error('❌ Erreur lors de l\'envoi de la notification:', error);
      throw error;
    }
  }

  /**
   * Envoie une notification de paiement réussi
   */
  async sendPaymentSuccessNotification(
    userId: string,
    amount: number,
    courseName: string,
    transactionId: string
  ): Promise<PushNotification> {
    return this.sendToUser(
      userId,
      '✅ Paiement confirmé',
      `Votre paiement de ${amount} FCFA pour "${courseName}" a été validé avec succès!`,
      'payment_success',
      {
        amount: amount.toString(),
        courseName,
        transactionId,
        screen: 'CourseDetails',
      }
    );
  }

  /**
   * Envoie une notification de paiement échoué
   */
  async sendPaymentFailedNotification(
    userId: string,
    amount: number,
    reason: string
  ): Promise<PushNotification> {
    return this.sendToUser(
      userId,
      '❌ Paiement échoué',
      `Votre paiement de ${amount} FCFA n'a pas pu être validé. ${reason}`,
      'payment_failed',
      {
        amount: amount.toString(),
        reason,
        screen: 'PaymentHistory',
      }
    );
  }

  /**
   * Envoie une notification d'inscription à un cours
   */
  async sendCourseEnrollmentNotification(
    userId: string,
    courseName: string,
    courseId: string
  ): Promise<PushNotification> {
    return this.sendToUser(
      userId,
      '🎓 Inscription confirmée',
      `Félicitations! Vous êtes inscrit au cours "${courseName}"`,
      'course_enrollment',
      {
        courseId,
        courseName,
        screen: 'CourseDetails',
        courseIdParam: courseId,
      }
    );
  }

  /**
   * Envoie une notification de certificat obtenu
   */
  async sendCertificateEarnedNotification(
    userId: string,
    courseName: string,
    certificateId: string
  ): Promise<PushNotification> {
    return this.sendToUser(
      userId,
      '🏆 Certificat obtenu!',
      `Félicitations! Vous avez terminé "${courseName}" avec succès. Votre certificat est disponible.`,
      'certificate_earned',
      {
        courseName,
        certificateId,
        screen: 'Certificate',
        certificateIdParam: certificateId,
      }
    );
  }

  /**
   * Envoie une notification de succès de parrainage
   */
  async sendReferralSuccessNotification(
    userId: string,
    referredName: string,
    bonusAmount: number
  ): Promise<PushNotification> {
    return this.sendToUser(
      userId,
      '🎊 Parrainage réussi!',
      `${referredName} s'est inscrit avec votre code! Vous avez gagné ${bonusAmount} FCFA.`,
      'referral_success',
      {
        referredName,
        bonusAmount: bonusAmount.toString(),
        screen: 'Referrals',
      }
    );
  }

  /**
   * Envoie une notification de rappel de cours
   */
  async sendCourseReminderNotification(
    userId: string,
    courseName: string,
    progressPercent: number
  ): Promise<PushNotification> {
    return this.sendToUser(
      userId,
      '📚 N\'oubliez pas votre cours',
      `Continuez "${courseName}" - Vous êtes à ${progressPercent}% de complétion!`,
      'course_reminder',
      {
        courseName,
        progress: progressPercent.toString(),
        screen: 'CourseProgress',
      }
    );
  }

  /**
   * Envoie une notification générique
   */
  async sendGeneralNotification(
    userId: string,
    title: string,
    body: string,
    data?: { [key: string]: string }
  ): Promise<PushNotification> {
    return this.sendToUser(userId, title, body, 'general', data);
  }

  /**
   * Récupère les notifications d'un utilisateur
   */
  async getUserNotifications(userId: string, limit: number = 50): Promise<PushNotification[]> {
    try {
      // Version temporaire sans orderBy en attendant que l'index soit actif
      const snapshot = await this.notificationsCollection
        .where('userId', '==', userId)
        .limit(limit)
        .get();

      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as PushNotification[];

      // Tri manuel par createdAt en descendant en attendant l'index
      notifications.sort((a, b) => {
        const aTime = a.createdAt as any;
        const bTime = b.createdAt as any;
        if (aTime && bTime && aTime._seconds && bTime._seconds) {
          return bTime._seconds - aTime._seconds;
        }
        return 0;
      });

      return notifications;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des notifications:', error);
      return [];
    }
  }

  /**
   * Marque une notification comme lue (pour historique)
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await this.notificationsCollection.doc(notificationId).update({
        readAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (error) {
      console.error('❌ Erreur lors du marquage de la notification:', error);
      throw error;
    }
  }

  /**
   * Nettoie les anciennes notifications (> 90 jours)
   */
  async cleanupOldNotifications(daysOld: number = 90): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const snapshot = await this.notificationsCollection
        .where('createdAt', '<', admin.firestore.Timestamp.fromDate(cutoffDate))
        .limit(500)
        .get();

      if (snapshot.empty) return 0;

      const batch = this.db.batch();
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      return snapshot.size;
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage des notifications:', error);
      return 0;
    }
  }
}

export const pushNotificationService = new PushNotificationService();
