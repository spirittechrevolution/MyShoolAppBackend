/**
 * Service d'envoi de SMS via Firestore Queue
 * Les SMS sont ajoutés à Firestore, puis envoyés par une Cloud Function
 * Approche native Firebase - pas besoin d'extensions tierces
 */

import * as admin from 'firebase-admin';

/**
 * Statut d'un SMS
 */
export type SmsStatus = 'pending' | 'sent' | 'failed' | 'delivered';

/**
 * Type de SMS
 */
export type SmsType = 
  | 'referral_invitation'      // Invitation de parrainage
  | 'welcome'                   // Bienvenue après inscription
  | 'referral_success'          // Succès de parrainage
  | 'payment_initiated'         // Paiement initié
  | 'payment_success'           // Paiement réussi
  | 'payment_failed'            // Paiement échoué
  | 'course_enrollment'         // Inscription à un cours
  | 'course_reminder'           // Rappel de cours
  | 'certificate_earned'        // Certificat obtenu
  | 'password_reset'            // Réinitialisation mot de passe
  | 'account_verification'      // Vérification de compte
  | 'general';                  // Message générique

/**
 * Interface pour un SMS
 */
export interface SmsMessage {
  id?: string;
  to: string;                    // Format: +221XXXXXXXXX
  message: string;
  from?: string;                 // Nom de l'expéditeur
  status: SmsStatus;
  type: SmsType;
  metadata?: {
    referralCode?: string;
    referrerName?: string;
    referredName?: string;
    bonusAmount?: number;
    userId?: string;
    courseId?: string;
    courseName?: string;
    paymentId?: string;
    transactionId?: string;
    amount?: number;
    certificateId?: string;
    verificationCode?: string;
  };
  createdAt: admin.firestore.Timestamp | admin.firestore.FieldValue;
  sentAt?: admin.firestore.Timestamp;
  deliveredAt?: admin.firestore.Timestamp;
  error?: string;
  provider?: string;
  retryCount?: number;
}

/**
 * Interface pour les statistiques SMS
 */
export interface SmsStats {
  total: number;
  sent: number;
  pending: number;
  failed: number;
  delivered: number;
}

/**
 * Service d'envoi de SMS
 * Utilise Firestore comme queue de messages
 */
export class SmsService {
  private db: admin.firestore.Firestore;
  private smsCollection: admin.firestore.CollectionReference;

  constructor() {
    this.db = admin.firestore();
    this.smsCollection = this.db.collection('sms_queue');
  }

  /**
   * Valide un numéro de téléphone sénégalais
   */
  private validatePhoneNumber(phoneNumber: string): boolean {
    // Format attendu: +221XXXXXXXXX (9 chiffres après +221)
    const senegalPhoneRegex = /^\+221[0-9]{9}$/;
    return senegalPhoneRegex.test(phoneNumber);
  }

  /**
   * Formatte un numéro de téléphone
   */
  private formatPhoneNumber(phoneNumber: string): string {
    // Enlève les espaces et tirets
    let cleaned = phoneNumber.replace(/[\s-]/g, '');
    
    // Si commence par 00221, remplace par +221
    if (cleaned.startsWith('00221')) {
      cleaned = '+221' + cleaned.substring(5);
    }
    
    // Si commence par 221 (sans +), ajoute +
    if (cleaned.startsWith('221') && !cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }
    
    // Si commence par 7 ou 3 (numéros locaux), ajoute +221
    if (/^[37][0-9]{8}$/.test(cleaned)) {
      cleaned = '+221' + cleaned;
    }
    
    return cleaned;
  }

  /**
   * Envoie un SMS générique
   * Ajoute le message à la queue Firestore
   */
  async sendSms(to: string, message: string, from: string = 'MySchool'): Promise<SmsMessage> {
    try {
      // Formatte et valide le numéro
      const formattedPhone = this.formatPhoneNumber(to);
      
      if (!this.validatePhoneNumber(formattedPhone)) {
        throw new Error(`Numéro de téléphone invalide: ${to}. Format attendu: +221XXXXXXXXX`);
      }

      // Crée le message SMS
      const smsData: SmsMessage = {
        to: formattedPhone,
        message,
        from,
        status: 'pending',
        type: 'general',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        retryCount: 0,
      };

      // Ajoute à la collection Firestore
      const docRef = await this.smsCollection.add(smsData);
      
      // Retourne le message avec son ID
      return {
        ...smsData,
        id: docRef.id,
        createdAt: admin.firestore.Timestamp.now(),
      };
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi du SMS:', error);
      throw new Error(`Impossible d'envoyer le SMS: ${error.message}`);
    }
  }

  /**
   * Envoie une invitation de parrainage par SMS
   */
  async sendReferralSms(
    to: string,
    referrerName: string,
    referralCode: string,
    bonusAmount: number
  ): Promise<SmsMessage> {
    const message = `🎓 ${referrerName} t'invite sur MySchool! 
    
Inscris-toi avec le code ${referralCode} et reçois ${bonusAmount} FCFA de bonus! 

📱 Télécharge l'app: https://beta.myschool.sn/join?ref=${referralCode}

MySchool - Apprends à ton rythme`;

    const smsData: SmsMessage = {
      to: this.formatPhoneNumber(to),
      message,
      from: 'MySchool',
      status: 'pending',
      type: 'referral_invitation',
      metadata: {
        referralCode,
        referrerName,
        bonusAmount,
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      retryCount: 0,
    };

    const docRef = await this.smsCollection.add(smsData);
    
    return {
      ...smsData,
      id: docRef.id,
      createdAt: admin.firestore.Timestamp.now(),
    };
  }

  /**
   * Envoie un SMS de bienvenue après inscription
   */
  async sendWelcomeSms(
    to: string,
    firstName: string,
    bonusAmount?: number
  ): Promise<SmsMessage> {
    let message = `🎉 Bienvenue sur MySchool, ${firstName}!

Ton compte a été créé avec succès.`;

    if (bonusAmount) {
      message += `\n\n💰 Tu as reçu ${bonusAmount} FCFA de bonus de parrainage!`;
    }

    message += `\n\n📚 Commence dès maintenant à apprendre avec nos cours.

Bonne formation!
MySchool`;

    const smsData: SmsMessage = {
      to: this.formatPhoneNumber(to),
      message,
      from: 'MySchool',
      status: 'pending',
      type: 'welcome',
      metadata: {
        bonusAmount,
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      retryCount: 0,
    };

    const docRef = await this.smsCollection.add(smsData);
    
    return {
      ...smsData,
      id: docRef.id,
      createdAt: admin.firestore.Timestamp.now(),
    };
  }

  /**
   * Envoie un SMS de succès au parrain
   */
  async sendReferralSuccessSms(
    to: string,
    referrerName: string,
    referredName: string,
    bonusAmount: number
  ): Promise<SmsMessage> {
    const message = `🎊 Félicitations ${referrerName}!

${referredName} s'est inscrit avec ton code de parrainage!

💰 Tu as gagné ${bonusAmount} FCFA de bonus!

Continue à parrainer et gagne encore plus!
MySchool`;

    const smsData: SmsMessage = {
      to: this.formatPhoneNumber(to),
      message,
      from: 'MySchool',
      status: 'pending',
      type: 'referral_success',
      metadata: {
        referrerName,
        referredName,
        bonusAmount,
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      retryCount: 0,
    };

    const docRef = await this.smsCollection.add(smsData);
    
    return {
      ...smsData,
      id: docRef.id,
      createdAt: admin.firestore.Timestamp.now(),
    };
  }

  /**
   * Envoie un SMS de paiement initié
   */
  async sendPaymentInitiatedSms(
    to: string,
    firstName: string,
    amount: number,
    paymentMethod: string,
    transactionId: string
  ): Promise<SmsMessage> {
    const message = `💳 Paiement en cours - MySchool

Bonjour ${firstName},

Votre paiement de ${amount} FCFA via ${paymentMethod} a été initié.

Transaction: ${transactionId}

Veuillez valider le paiement sur votre téléphone.

MySchool`;

    const smsData: SmsMessage = {
      to: this.formatPhoneNumber(to),
      message,
      from: 'MySchool',
      status: 'pending',
      type: 'payment_initiated',
      metadata: {
        amount,
        transactionId,
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      retryCount: 0,
    };

    const docRef = await this.smsCollection.add(smsData);
    
    return {
      ...smsData,
      id: docRef.id,
      createdAt: admin.firestore.Timestamp.now(),
    };
  }

  /**
   * Envoie un SMS de paiement réussi
   */
  async sendPaymentSuccessSms(
    to: string,
    firstName: string,
    amount: number,
    courseName: string,
    transactionId: string
  ): Promise<SmsMessage> {
    const message = `✅ Paiement confirmé - MySchool

Bonjour ${firstName},

Votre paiement de ${amount} FCFA a été validé avec succès!

Cours: ${courseName}
Transaction: ${transactionId}

Vous pouvez maintenant accéder à votre cours.

Bonne formation!
MySchool`;

    const smsData: SmsMessage = {
      to: this.formatPhoneNumber(to),
      message,
      from: 'MySchool',
      status: 'pending',
      type: 'payment_success',
      metadata: {
        amount,
        transactionId,
        courseName,
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      retryCount: 0,
    };

    const docRef = await this.smsCollection.add(smsData);
    
    return {
      ...smsData,
      id: docRef.id,
      createdAt: admin.firestore.Timestamp.now(),
    };
  }

  /**
   * Envoie un SMS de paiement échoué
   */
  async sendPaymentFailedSms(
    to: string,
    firstName: string,
    amount: number,
    reason: string,
    transactionId: string
  ): Promise<SmsMessage> {
    const message = `❌ Paiement échoué - MySchool

Bonjour ${firstName},

Votre paiement de ${amount} FCFA n'a pas pu être validé.

Raison: ${reason}
Transaction: ${transactionId}

Veuillez réessayer ou contacter le support.

MySchool`;

    const smsData: SmsMessage = {
      to: this.formatPhoneNumber(to),
      message,
      from: 'MySchool',
      status: 'pending',
      type: 'payment_failed',
      metadata: {
        amount,
        transactionId,
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      retryCount: 0,
    };

    const docRef = await this.smsCollection.add(smsData);
    
    return {
      ...smsData,
      id: docRef.id,
      createdAt: admin.firestore.Timestamp.now(),
    };
  }

  /**
   * Envoie un SMS d'inscription à un cours
   */
  async sendCourseEnrollmentSms(
    to: string,
    firstName: string,
    courseName: string,
    courseId: string
  ): Promise<SmsMessage> {
    const message = `🎓 Inscription confirmée - MySchool

Félicitations ${firstName}!

Vous êtes maintenant inscrit au cours:
${courseName}

Commencez votre apprentissage dès maintenant dans l'application.

Bonne formation!
MySchool`;

    const smsData: SmsMessage = {
      to: this.formatPhoneNumber(to),
      message,
      from: 'MySchool',
      status: 'pending',
      type: 'course_enrollment',
      metadata: {
        courseName,
        courseId,
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      retryCount: 0,
    };

    const docRef = await this.smsCollection.add(smsData);
    
    return {
      ...smsData,
      id: docRef.id,
      createdAt: admin.firestore.Timestamp.now(),
    };
  }

  /**
   * Envoie un SMS de rappel de cours
   */
  async sendCourseReminderSms(
    to: string,
    firstName: string,
    courseName: string,
    progressPercent: number
  ): Promise<SmsMessage> {
    const message = `📚 Rappel - MySchool

Bonjour ${firstName},

N'oubliez pas de continuer votre cours:
${courseName}

Progression actuelle: ${progressPercent}%

Continuez pour atteindre 100% et obtenir votre certificat!

MySchool`;

    const smsData: SmsMessage = {
      to: this.formatPhoneNumber(to),
      message,
      from: 'MySchool',
      status: 'pending',
      type: 'course_reminder',
      metadata: {
        courseName,
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      retryCount: 0,
    };

    const docRef = await this.smsCollection.add(smsData);
    
    return {
      ...smsData,
      id: docRef.id,
      createdAt: admin.firestore.Timestamp.now(),
    };
  }

  /**
   * Envoie un SMS de certificat obtenu
   */
  async sendCertificateEarnedSms(
    to: string,
    firstName: string,
    courseName: string,
    certificateId: string
  ): Promise<SmsMessage> {
    const message = `🏆 Certificat obtenu - MySchool

Félicitations ${firstName}!

Vous avez terminé le cours avec succès:
${courseName}

Votre certificat est disponible dans l'application.

ID: ${certificateId}

Continuez comme ça!
MySchool`;

    const smsData: SmsMessage = {
      to: this.formatPhoneNumber(to),
      message,
      from: 'MySchool',
      status: 'pending',
      type: 'certificate_earned',
      metadata: {
        courseName,
        certificateId,
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      retryCount: 0,
    };

    const docRef = await this.smsCollection.add(smsData);
    
    return {
      ...smsData,
      id: docRef.id,
      createdAt: admin.firestore.Timestamp.now(),
    };
  }

  /**
   * Envoie un SMS de réinitialisation de mot de passe
   */
  async sendPasswordResetSms(
    to: string,
    firstName: string,
    verificationCode: string
  ): Promise<SmsMessage> {
    const message = `🔐 Réinitialisation mot de passe - MySchool

Bonjour ${firstName},

Code de vérification: ${verificationCode}

Ce code expire dans 15 minutes.

Si vous n'avez pas demandé cette réinitialisation, ignorez ce message.

MySchool`;

    const smsData: SmsMessage = {
      to: this.formatPhoneNumber(to),
      message,
      from: 'MySchool',
      status: 'pending',
      type: 'password_reset',
      metadata: {
        verificationCode,
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      retryCount: 0,
    };

    const docRef = await this.smsCollection.add(smsData);
    
    return {
      ...smsData,
      id: docRef.id,
      createdAt: admin.firestore.Timestamp.now(),
    };
  }

  /**
   * Envoie un SMS de vérification de compte
   */
  async sendAccountVerificationSms(
    to: string,
    firstName: string,
    verificationCode: string
  ): Promise<SmsMessage> {
    const message = `✅ Vérification compte - MySchool

Bonjour ${firstName},

Code de vérification: ${verificationCode}

Entrez ce code dans l'application pour vérifier votre compte.

Ce code expire dans 15 minutes.

MySchool`;

    const smsData: SmsMessage = {
      to: this.formatPhoneNumber(to),
      message,
      from: 'MySchool',
      status: 'pending',
      type: 'account_verification',
      metadata: {
        verificationCode,
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      retryCount: 0,
    };

    const docRef = await this.smsCollection.add(smsData);
    
    return {
      ...smsData,
      id: docRef.id,
      createdAt: admin.firestore.Timestamp.now(),
    };
  }

  /**
   * Récupère le statut d'un SMS
   */
  async getSmsStatus(smsId: string): Promise<SmsMessage | null> {
    try {
      const doc = await this.smsCollection.doc(smsId).get();
      
      if (!doc.exists) {
        return null;
      }

      return {
        id: doc.id,
        ...doc.data(),
      } as SmsMessage;
    } catch (error) {
      console.error('Erreur lors de la récupération du SMS:', error);
      return null;
    }
  }

  /**
   * Récupère les SMS d'un utilisateur
   */
  async getUserSms(phoneNumber: string, limit: number = 50): Promise<SmsMessage[]> {
    try {
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      
      const snapshot = await this.smsCollection
        .where('to', '==', formattedPhone)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as SmsMessage[];
    } catch (error) {
      console.error('Erreur lors de la récupération des SMS:', error);
      return [];
    }
  }

  /**
   * Récupère les SMS en attente
   */
  async getPendingSms(limit: number = 100): Promise<SmsMessage[]> {
    try {
      const snapshot = await this.smsCollection
        .where('status', '==', 'pending')
        .orderBy('createdAt', 'asc')
        .limit(limit)
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as SmsMessage[];
    } catch (error) {
      console.error('Erreur lors de la récupération des SMS en attente:', error);
      return [];
    }
  }

  /**
   * Met à jour le statut d'un SMS
   */
  async updateSmsStatus(
    smsId: string,
    status: SmsStatus,
    error?: string
  ): Promise<void> {
    try {
      const updateData: any = {
        status,
      };

      if (status === 'sent') {
        updateData.sentAt = admin.firestore.FieldValue.serverTimestamp();
      } else if (status === 'delivered') {
        updateData.deliveredAt = admin.firestore.FieldValue.serverTimestamp();
      }

      if (error) {
        updateData.error = error;
      }

      await this.smsCollection.doc(smsId).update(updateData);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du SMS:', error);
      throw error;
    }
  }

  /**
   * Récupère les statistiques SMS
   */
  async getSmsStats(): Promise<SmsStats> {
    try {
      // Total
      const totalSnapshot = await this.smsCollection.get();
      const total = totalSnapshot.size;

      // Sent
      const sentSnapshot = await this.smsCollection
        .where('status', '==', 'sent')
        .get();
      const sent = sentSnapshot.size;

      // Pending
      const pendingSnapshot = await this.smsCollection
        .where('status', '==', 'pending')
        .get();
      const pending = pendingSnapshot.size;

      // Failed
      const failedSnapshot = await this.smsCollection
        .where('status', '==', 'failed')
        .get();
      const failed = failedSnapshot.size;

      // Delivered
      const deliveredSnapshot = await this.smsCollection
        .where('status', '==', 'delivered')
        .get();
      const delivered = deliveredSnapshot.size;

      return {
        total,
        sent,
        pending,
        failed,
        delivered,
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des stats SMS:', error);
      return {
        total: 0,
        sent: 0,
        pending: 0,
        failed: 0,
        delivered: 0,
      };
    }
  }

  /**
   * Supprime les SMS anciens (nettoyage)
   */
  async cleanupOldSms(daysOld: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const snapshot = await this.smsCollection
        .where('createdAt', '<', admin.firestore.Timestamp.fromDate(cutoffDate))
        .where('status', 'in', ['sent', 'delivered', 'failed'])
        .get();

      const batch = this.db.batch();
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      return snapshot.size;
    } catch (error) {
      console.error('Erreur lors du nettoyage des SMS:', error);
      return 0;
    }
  }
}

export const smsService = new SmsService();
