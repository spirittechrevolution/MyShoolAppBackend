import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialiser Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Configurer Firestore pour utiliser la bonne base de données
db.settings({
  databaseId: 'myschool-1',
  ignoreUndefinedProperties: true
});

// ============ EXPORT DE L'API EXPRESS ============
export { api } from './api';

// ============ CLOUD FUNCTIONS TRIGGERS ============

/**
 * Trigger: Quand un enrollment est créé
 * Action: Initialiser les métadonnées du cours et envoyer une notification
 */
export const onEnrollmentCreated = functions.firestore
  .document('enrollments/{enrollmentId}')
  .onCreate(async (snap, context) => {
    const enrollment = snap.data();
    const enrollmentId = context.params.enrollmentId;

    try {
      // Récupérer les infos du cours
      const courseDoc = await db.collection('courses').doc(enrollment.courseId).get();
      
      if (!courseDoc.exists) {
        console.error(`Cours ${enrollment.courseId} non trouvé`);
        return;
      }

      const courseData = courseDoc.data();

      // Incrémenter le compteur d'inscriptions du cours
      await db.collection('courses').doc(enrollment.courseId).update({
        enrollmentCount: admin.firestore.FieldValue.increment(1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Créer une notification pour l'utilisateur
      await db.collection('notifications').add({
        userId: enrollment.userId,
        type: 'enrollment_created',
        title: 'Inscription confirmée',
        message: `Vous êtes maintenant inscrit au cours: ${courseData?.title || 'Sans titre'}`,
        enrollmentId: enrollmentId,
        courseId: enrollment.courseId,
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Logger l'événement
      await db.collection('analytics_events').add({
        eventType: 'enrollment_created',
        userId: enrollment.userId,
        courseId: enrollment.courseId,
        enrollmentId: enrollmentId,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log(`✅ Enrollment créé: ${enrollmentId}`);
    } catch (error) {
      console.error('Erreur dans onEnrollmentCreated:', error);
    }
  });

/**
 * Trigger: Quand un enrollment est complété (status = completed)
 * Action: Générer un certificat et envoyer une notification
 */
export const onEnrollmentCompleted = functions.firestore
  .document('enrollments/{enrollmentId}')
  .onUpdate(async (change, context) => {
    const beforeData = change.before.data();
    const afterData = change.after.data();
    const enrollmentId = context.params.enrollmentId;

    // Vérifier si le statut vient de passer à "completed"
    if (beforeData.status !== 'completed' && afterData.status === 'completed') {
      try {
        // Récupérer les infos du cours
        const courseDoc = await db.collection('courses').doc(afterData.courseId).get();
        const courseData = courseDoc.data();

        // Récupérer les infos de l'utilisateur
        const userDoc = await db.collection('utilisateur').doc(afterData.userId).get();
        const userData = userDoc.data();

        // Créer un certificat
        const certificateId = `cert_${enrollmentId}_${Date.now()}`;
        await db.collection('certificates').doc(certificateId).set({
          userId: afterData.userId,
          userName: userData?.name || 'Utilisateur',
          courseId: afterData.courseId,
          courseTitle: courseData?.title || 'Sans titre',
          enrollmentId: enrollmentId,
          completedAt: afterData.completedAt || admin.firestore.FieldValue.serverTimestamp(),
          issuedAt: admin.firestore.FieldValue.serverTimestamp(),
          certificateNumber: certificateId
        });

        // Mettre à jour l'enrollment avec l'ID du certificat
        await change.after.ref.update({
          certificateId: certificateId
        });

        // Créer une notification de félicitations
        await db.collection('notifications').add({
          userId: afterData.userId,
          type: 'course_completed',
          title: '🎉 Félicitations !',
          message: `Vous avez terminé le cours: ${courseData?.title || 'Sans titre'}. Votre certificat est disponible.`,
          enrollmentId: enrollmentId,
          courseId: afterData.courseId,
          certificateId: certificateId,
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Incrémenter le compteur de cours complétés par l'utilisateur
        await db.collection('utilisateur').doc(afterData.userId).update({
          completedCoursesCount: admin.firestore.FieldValue.increment(1),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Logger l'événement
        await db.collection('analytics_events').add({
          eventType: 'course_completed',
          userId: afterData.userId,
          courseId: afterData.courseId,
          enrollmentId: enrollmentId,
          certificateId: certificateId,
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log(`🎓 Cours complété: ${enrollmentId}, Certificat: ${certificateId}`);
      } catch (error) {
        console.error('Erreur dans onEnrollmentCompleted:', error);
      }
    }
  });

/**
 * Trigger: Quand une leçon est ajoutée à un chapitre
 * Action: Mettre à jour le compteur de leçons du cours
 */
export const onLessonCreated = functions.firestore
  .document('courses/{courseId}/chapters/{chapterId}/lessons/{lessonId}')
  .onCreate(async (snap, context) => {
    const { courseId, chapterId } = context.params;

    try {
      // Incrémenter le compteur de leçons dans le cours
      await db.collection('courses').doc(courseId).update({
        totalLessons: admin.firestore.FieldValue.increment(1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Mettre à jour le chapitre
      await db.collection('courses').doc(courseId)
        .collection('chapters').doc(chapterId).update({
          lessonCount: admin.firestore.FieldValue.increment(1),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

      console.log(`✅ Leçon créée dans ${courseId}/${chapterId}`);
    } catch (error) {
      console.error('Erreur dans onLessonCreated:', error);
    }
  });

/**
 * Trigger: Quand un exercice est ajouté à un chapitre
 * Action: Mettre à jour le compteur d'exercices du cours
 */
export const onExerciseCreated = functions.firestore
  .document('courses/{courseId}/chapters/{chapterId}/exercises/{exerciseId}')
  .onCreate(async (snap, context) => {
    const { courseId, chapterId } = context.params;

    try {
      // Incrémenter le compteur d'exercices dans le cours
      await db.collection('courses').doc(courseId).update({
        totalExercises: admin.firestore.FieldValue.increment(1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Mettre à jour le chapitre
      await db.collection('courses').doc(courseId)
        .collection('chapters').doc(chapterId).update({
          exerciseCount: admin.firestore.FieldValue.increment(1),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

      console.log(`✅ Exercice créé dans ${courseId}/${chapterId}`);
    } catch (error) {
      console.error('Erreur dans onExerciseCreated:', error);
    }
  });

/**
 * Cloud Function HTTP: Calculer la progression d'un enrollment
 * Optimisé avec les compteurs stockés dans le cours
 */
export const calculateEnrollmentProgress = functions.https.onCall(async (data, context) => {
  // Vérifier l'authentification
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'L\'utilisateur doit être authentifié'
    );
  }

  const { enrollmentId } = data;

  if (!enrollmentId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'enrollmentId est requis'
    );
  }

  try {
    // Récupérer l'enrollment
    const enrollmentDoc = await db.collection('enrollments').doc(enrollmentId).get();
    
    if (!enrollmentDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Enrollment non trouvé'
      );
    }

    const enrollment = enrollmentDoc.data()!;

    // Vérifier que l'utilisateur est propriétaire
    if (enrollment.userId !== context.auth.uid) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Accès non autorisé'
      );
    }

    // Récupérer les totaux depuis le cours
    const courseDoc = await db.collection('courses').doc(enrollment.courseId).get();
    const courseData = courseDoc.data();

    const totalLessons = courseData?.totalLessons || 0;
    const totalExercises = courseData?.totalExercises || 0;
    const totalItems = totalLessons + totalExercises;

    if (totalItems === 0) {
      return { progressPercentage: 0 };
    }

    const completedLessons = enrollment.progress?.completedLessons?.length || 0;
    const completedExercises = enrollment.progress?.completedExercises?.length || 0;
    const completedItems = completedLessons + completedExercises;

    const progressPercentage = Math.round((completedItems / totalItems) * 100);

    // Mettre à jour l'enrollment
    await enrollmentDoc.ref.update({
      'progress.progressPercentage': progressPercentage,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Si 100% et pas encore complété, marquer comme complété
    if (progressPercentage >= 100 && enrollment.status === 'active') {
      await enrollmentDoc.ref.update({
        status: 'completed',
        completedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    return {
      progressPercentage,
      completedLessons,
      completedExercises,
      totalLessons,
      totalExercises
    };
  } catch (error) {
    console.error('Erreur dans calculateEnrollmentProgress:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Erreur lors du calcul de la progression'
    );
  }
});

/**
 * Cloud Function HTTP: Obtenir les statistiques d'un cours
 */
export const getCourseStatistics = functions.https.onCall(async (data, context) => {
  const { courseId } = data;

  if (!courseId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'courseId est requis'
    );
  }

  try {
    // Compter les enrollments par statut
    const enrollmentsSnapshot = await db.collection('enrollments')
      .where('courseId', '==', courseId)
      .get();

    let activeCount = 0;
    let completedCount = 0;
    let suspendedCount = 0;
    let cancelledCount = 0;
    let totalProgress = 0;

    enrollmentsSnapshot.forEach(doc => {
      const enrollment = doc.data();
      
      switch (enrollment.status) {
      case 'active': activeCount++; break;
      case 'completed': completedCount++; break;
      case 'suspended': suspendedCount++; break;
      case 'cancelled': cancelledCount++; break;
      }

      totalProgress += enrollment.progress?.progressPercentage || 0;
    });

    const totalEnrollments = enrollmentsSnapshot.size;
    const averageProgress = totalEnrollments > 0 
      ? Math.round(totalProgress / totalEnrollments) 
      : 0;

    const completionRate = totalEnrollments > 0
      ? Math.round((completedCount / totalEnrollments) * 100)
      : 0;

    return {
      totalEnrollments,
      activeEnrollments: activeCount,
      completedEnrollments: completedCount,
      suspendedEnrollments: suspendedCount,
      cancelledEnrollments: cancelledCount,
      averageProgress,
      completionRate
    };
  } catch (error) {
    console.error('Erreur dans getCourseStatistics:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Erreur lors de la récupération des statistiques'
    );
  }
});

/**
 * Cloud Function HTTP: Nettoyer les anciens enrollments annulés (> 90 jours)
 * À exécuter via un scheduler (Cloud Scheduler)
 */
export const cleanupOldCancelledEnrollments = functions.pubsub
  .schedule('0 2 * * 0') // Chaque dimanche à 2h du matin
  .onRun(async (context) => {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    try {
      const cancelledEnrollments = await db.collection('enrollments')
        .where('status', '==', 'cancelled')
        .where('updatedAt', '<', admin.firestore.Timestamp.fromDate(ninetyDaysAgo))
        .get();

      const batch = db.batch();
      let count = 0;

      cancelledEnrollments.forEach(doc => {
        batch.delete(doc.ref);
        count++;
      });

      if (count > 0) {
        await batch.commit();
        console.log(`🗑️ ${count} enrollments annulés supprimés`);
      } else {
        console.log('Aucun enrollment à nettoyer');
      }
    } catch (error) {
      console.error('Erreur dans cleanupOldCancelledEnrollments:', error);
    }
  });

/**
 * Cloud Function HTTP: Envoyer un rappel aux utilisateurs inactifs
 * À exécuter via un scheduler
 */
export const sendInactiveUserReminders = functions.pubsub
  .schedule('0 10 * * 1') // Chaque lundi à 10h du matin
  .onRun(async (context) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    try {
      // Trouver les enrollments actifs sans activité depuis 7 jours
      const inactiveEnrollments = await db.collection('enrollments')
        .where('status', '==', 'active')
        .where('progress.lastAccessedAt', '<', admin.firestore.Timestamp.fromDate(sevenDaysAgo))
        .get();

      const batch = db.batch();
      let count = 0;

      for (const doc of inactiveEnrollments.docs) {
        const enrollment = doc.data();
        
        // Récupérer les infos du cours
        const courseDoc = await db.collection('courses').doc(enrollment.courseId).get();
        const courseData = courseDoc.data();

        // Créer une notification de rappel
        const notificationRef = db.collection('notifications').doc();
        batch.set(notificationRef, {
          userId: enrollment.userId,
          type: 'inactivity_reminder',
          title: 'Continuez votre apprentissage',
          message: `Vous n\'avez pas accédé au cours "${courseData?.title || 'Sans titre'}" depuis 7 jours. Continuez là où vous vous êtes arrêté !`,
          enrollmentId: doc.id,
          courseId: enrollment.courseId,
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        count++;
      }

      if (count > 0) {
        await batch.commit();
        console.log(`📧 ${count} rappels envoyés`);
      } else {
        console.log('Aucun utilisateur inactif');
      }
    } catch (error) {
      console.error('Erreur dans sendInactiveUserReminders:', error);
    }
  });