/**
 * Cloud Functions pour l'envoi automatique de SMS et notifications push
 * Se déclenchent sur les événements Firestore (paiements, inscriptions, etc.)
 */

import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';
import { smsService } from './services/sms.service';
import { pushNotificationService } from './services/push-notification.service';

/**
 * Envoie un SMS quand un paiement est créé
 */
export const sendSmsOnPaymentCreated = onDocumentCreated(
  {
    document: 'payments/{paymentId}',
    region: 'us-central1',
  },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const payment = snapshot.data();
    
    console.log(`💳 Nouveau paiement créé: ${event.params.paymentId}`, {
      userId: payment.userId,
      amount: payment.amount,
      status: payment.status,
    });

    try {
      // Récupère les infos de l'utilisateur
      const userDoc = await admin.firestore()
        .collection('users')
        .doc(payment.userId)
        .get();

      if (!userDoc.exists) {
        console.log('❌ Utilisateur non trouvé');
        return;
      }

      const user = userDoc.data();
      if (!user?.phoneNumber) {
        console.log('❌ Numéro de téléphone non disponible');
        return;
      }

      // Récupère les infos du cours si enrollmentId disponible
      let courseName = 'votre cours';
      if (payment.enrollmentId) {
        const enrollmentDoc = await admin.firestore()
          .collection('enrollments')
          .doc(payment.enrollmentId)
          .get();

        if (enrollmentDoc.exists) {
          const enrollment = enrollmentDoc.data();
          if (enrollment?.courseId) {
            const courseDoc = await admin.firestore()
              .collection('courses')
              .doc(enrollment.courseId)
              .get();

            if (courseDoc.exists) {
              courseName = courseDoc.data()?.title || courseName;
            }
          }
        }
      }

      // Envoie SMS de paiement initié
      await smsService.sendPaymentInitiatedSms(
        user.phoneNumber,
        user.firstName || 'Utilisateur',
        payment.amount,
        payment.paymentMethod || 'Orange Money',
        payment.orderId || payment.id
      );

      console.log(`✅ SMS de paiement initié envoyé à ${user.phoneNumber}`);

      // Envoie également une notification push
      try {
        await pushNotificationService.sendToUser(
          payment.userId,
          '💳 Paiement en cours',
          `Votre paiement de ${payment.amount} FCFA via ${payment.paymentMethod || 'Orange Money'} a été initié.`,
          'payment_success',
          {
            amount: payment.amount.toString(),
            transactionId: payment.orderId || payment.id,
            screen: 'PaymentStatus',
          }
        );
        console.log('✅ Notification push de paiement initié envoyée');
      } catch (pushError) {
        console.log('⚠️ Notification push non envoyée (tokens manquants)');
      }
    } catch (error: any) {
      console.error('❌ Erreur envoi SMS paiement:', error.message);
    }
  }
);

/**
 * Envoie un SMS quand un paiement est mis à jour (succès/échec)
 */
export const sendSmsOnPaymentUpdated = onDocumentUpdated(
  {
    document: 'payments/{paymentId}',
    region: 'us-central1',
  },
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();

    if (!before || !after) return;

    // Si le statut n'a pas changé, ne rien faire
    if (before.status === after.status) return;

    console.log(`💳 Paiement mis à jour: ${event.params.paymentId}`, {
      oldStatus: before.status,
      newStatus: after.status,
    });

    try {
      // Récupère les infos de l'utilisateur
      const userDoc = await admin.firestore()
        .collection('users')
        .doc(after.userId)
        .get();

      if (!userDoc.exists) {
        console.log('❌ Utilisateur non trouvé');
        return;
      }

      const user = userDoc.data();
      if (!user?.phoneNumber) {
        console.log('❌ Numéro de téléphone non disponible');
        return;
      }

      // Récupère le nom du cours
      let courseName = 'votre cours';
      if (after.enrollmentId) {
        const enrollmentDoc = await admin.firestore()
          .collection('enrollments')
          .doc(after.enrollmentId)
          .get();

        if (enrollmentDoc.exists) {
          const enrollment = enrollmentDoc.data();
          if (enrollment?.courseId) {
            const courseDoc = await admin.firestore()
              .collection('courses')
              .doc(enrollment.courseId)
              .get();

            if (courseDoc.exists) {
              courseName = courseDoc.data()?.title || courseName;
            }
          }
        }
      }

      // Envoie le SMS selon le nouveau statut
      if (after.status === 'SUCCESSFUL' || after.status === 'COMPLETED') {
        await smsService.sendPaymentSuccessSms(
          user.phoneNumber,
          user.firstName || 'Utilisateur',
          after.amount,
          courseName,
          after.orderId || after.id
        );
        console.log(`✅ SMS de paiement réussi envoyé à ${user.phoneNumber}`);

        // Notification push de succès
        try {
          await pushNotificationService.sendPaymentSuccessNotification(
            after.userId,
            after.amount,
            courseName,
            after.orderId || after.id
          );
          console.log('✅ Notification push de paiement réussi envoyée');
        } catch (pushError) {
          console.log('⚠️ Notification push non envoyée');
        }
      } else if (after.status === 'FAILED' || after.status === 'CANCELLED') {
        await smsService.sendPaymentFailedSms(
          user.phoneNumber,
          user.firstName || 'Utilisateur',
          after.amount,
          after.failureReason || 'Transaction refusée',
          after.orderId || after.id
        );
        console.log(`✅ SMS de paiement échoué envoyé à ${user.phoneNumber}`);

        // Notification push d'échec
        try {
          await pushNotificationService.sendPaymentFailedNotification(
            after.userId,
            after.amount,
            after.failureReason || 'Transaction refusée'
          );
          console.log('✅ Notification push de paiement échoué envoyée');
        } catch (pushError) {
          console.log('⚠️ Notification push non envoyée');
        }
      }
    } catch (error: any) {
      console.error('❌ Erreur envoi SMS paiement:', error.message);
    }
  }
);

/**
 * Envoie un SMS quand un utilisateur s'inscrit à un cours
 */
export const sendSmsOnEnrollment = onDocumentCreated(
  {
    document: 'enrollments/{enrollmentId}',
    region: 'us-central1',
  },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const enrollment = snapshot.data();
    
    console.log(`📚 Nouvelle inscription: ${event.params.enrollmentId}`, {
      userId: enrollment.userId,
      courseId: enrollment.courseId,
    });

    try {
      // Récupère les infos de l'utilisateur
      const userDoc = await admin.firestore()
        .collection('users')
        .doc(enrollment.userId)
        .get();

      if (!userDoc.exists) {
        console.log('❌ Utilisateur non trouvé');
        return;
      }

      const user = userDoc.data();
      if (!user?.phoneNumber) {
        console.log('❌ Numéro de téléphone non disponible');
        return;
      }

      // Récupère les infos du cours
      const courseDoc = await admin.firestore()
        .collection('courses')
        .doc(enrollment.courseId)
        .get();

      if (!courseDoc.exists) {
        console.log('❌ Cours non trouvé');
        return;
      }

      const course = courseDoc.data();

      // Envoie SMS d'inscription au cours
      await smsService.sendCourseEnrollmentSms(
        user.phoneNumber,
        user.firstName || 'Utilisateur',
        course?.title || 'Nouveau cours',
        enrollment.courseId
      );

      console.log(`✅ SMS d'inscription envoyé à ${user.phoneNumber}`);

      // Envoie notification push d'inscription
      try {
        await pushNotificationService.sendCourseEnrollmentNotification(
          enrollment.userId,
          course?.title || 'Nouveau cours',
          enrollment.courseId
        );
        console.log('✅ Notification push d\'inscription envoyée');
      } catch (pushError) {
        console.log('⚠️ Notification push non envoyée');
      }
    } catch (error: any) {
      console.error('❌ Erreur envoi SMS inscription:', error.message);
    }
  }
);

/**
 * Envoie un SMS quand un utilisateur obtient un certificat
 * (Détecté quand enrollment.progress atteint 100%)
 */
export const sendSmsOnCertificateEarned = onDocumentUpdated(
  {
    document: 'enrollments/{enrollmentId}',
    region: 'us-central1',
  },
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();

    if (!before || !after) return;

    // Si le cours vient d'être complété (progress passe à 100%)
    const wasCompleted = before.progress === 100;
    const isCompleted = after.progress === 100;

    if (wasCompleted || !isCompleted) return;

    console.log(`🏆 Certificat obtenu: ${event.params.enrollmentId}`, {
      userId: after.userId,
      courseId: after.courseId,
    });

    try {
      // Récupère les infos de l'utilisateur
      const userDoc = await admin.firestore()
        .collection('users')
        .doc(after.userId)
        .get();

      if (!userDoc.exists) {
        console.log('❌ Utilisateur non trouvé');
        return;
      }

      const user = userDoc.data();
      if (!user?.phoneNumber) {
        console.log('❌ Numéro de téléphone non disponible');
        return;
      }

      // Récupère les infos du cours
      const courseDoc = await admin.firestore()
        .collection('courses')
        .doc(after.courseId)
        .get();

      if (!courseDoc.exists) {
        console.log('❌ Cours non trouvé');
        return;
      }

      const course = courseDoc.data();

      // Envoie SMS de certificat obtenu
      await smsService.sendCertificateEarnedSms(
        user.phoneNumber,
        user.firstName || 'Utilisateur',
        course?.title || 'Cours',
        event.params.enrollmentId
      );

      console.log(`✅ SMS de certificat envoyé à ${user.phoneNumber}`);

      // Envoie notification push de certificat
      try {
        await pushNotificationService.sendCertificateEarnedNotification(
          after.userId,
          course?.title || 'Cours',
          event.params.enrollmentId
        );
        console.log('✅ Notification push de certificat envoyée');
      } catch (pushError) {
        console.log('⚠️ Notification push non envoyée');
      }
    } catch (error: any) {
      console.error('❌ Erreur envoi SMS certificat:', error.message);
    }
  }
);
