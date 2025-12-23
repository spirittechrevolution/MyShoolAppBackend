const admin = require('firebase-admin');

// Initialiser Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require('./serviceAccountKey.json')),
  });
}

const db = admin.firestore();

async function testDirectFirestore() {
  console.log('🔍 Test direct Firestore après déploiement des index...\n');

  const userId = 'Cn8YpH1RBhOUcCZfrstJAwV2XbA3';
  
  try {
    // Test de la requête complète avec index
    console.log('📊 Test avec userId + orderBy...');
    const snapshot = await db.collection('push_notifications')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();
    
    console.log(`✅ Résultat: ${snapshot.size} notifications trouvées`);
    
    if (snapshot.size > 0) {
      snapshot.docs.forEach((doc, index) => {
        console.log(`\n📄 Notification ${index + 1}:`);
        console.log(`   ID: ${doc.id}`);
        console.log(`   Data:`, doc.data());
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testDirectFirestore();