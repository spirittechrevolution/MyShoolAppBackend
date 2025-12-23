/**
 * Script pour créer une notification push de test
 */

const admin = require('firebase-admin');

// Initialiser Firebase Admin si pas déjà fait
if (!admin.apps.length) {
  const serviceAccount = require('./serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://myschool-f862b.firebaseio.com`
  });
}

const db = admin.firestore();

async function createTestNotification() {
  console.log('📱 Création d\'une notification push de test...');
  
  try {
    const userId = 'Cn8YpH1RBhOUcCZfrstJAwV2XbA3';
    
    const testNotification = {
      userId: userId,
      title: "Bienvenue sur MySchool ! 🎓",
      body: "Découvrez nos nouveaux cours et commencez votre apprentissage dès maintenant !",
      type: 'general',
      data: {
        action: 'open_courses',
        screen: 'courses_list'
      },
      imageUrl: 'https://example.com/welcome-image.jpg',
      clickAction: 'OPEN_COURSES',
      sound: 'default',
      badge: 1,
      createdAt: admin.firestore.Timestamp.now(),
    };

    const docRef = await db.collection('push_notifications').add(testNotification);
    console.log(`✅ Notification créée avec l'ID: ${docRef.id}`);
    
    // Créer une deuxième notification
    const testNotification2 = {
      userId: userId,
      title: "Nouveau cours disponible 📚",
      body: "Introduction à JavaScript est maintenant disponible. Inscrivez-vous maintenant !",
      type: 'course_enrollment',
      data: {
        courseId: 'javascript-intro-001',
        action: 'open_course'
      },
      createdAt: admin.firestore.Timestamp.now(),
    };

    const docRef2 = await db.collection('push_notifications').add(testNotification2);
    console.log(`✅ Deuxième notification créée avec l'ID: ${docRef2.id}`);
    
    // Vérifier que les notifications ont été créées
    console.log('\n🔍 Vérification des notifications créées...');
    const snapshot = await db.collection('push_notifications')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();
      
    console.log(`📊 Nombre de notifications pour l'utilisateur: ${snapshot.docs.length}`);
    
    snapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`${index + 1}. ${data.title} - ${data.type}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur création notification:', error);
  }
}

createTestNotification();