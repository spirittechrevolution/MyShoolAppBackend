/**
 * Test direct Firestore pour déboguer le problème FAQs
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

async function testFirestoreConnection() {
  console.log('🔍 Test de connexion Firestore...');
  
  try {
    // Tester la connexion en listant les collections
    console.log('📋 Liste des collections:');
    const collections = await db.listCollections();
    collections.forEach(collection => {
      console.log(`  - ${collection.id}`);
    });
    
    // Tester spécifiquement la collection faqs
    console.log('\n📚 Test collection faqs:');
    const faqsRef = db.collection('faqs');
    const snapshot = await faqsRef.get();
    
    console.log(`Nombre de documents dans faqs: ${snapshot.docs.length}`);
    
    if (snapshot.docs.length > 0) {
      console.log('\n📄 Premier document:');
      const firstDoc = snapshot.docs[0];
      console.log(`ID: ${firstDoc.id}`);
      console.log('Data:', firstDoc.data());
    } else {
      console.log('⚠️ Aucun document trouvé dans la collection faqs');
    }
    
    // Test avec une requête simple
    console.log('\n🔍 Test requête simple:');
    const simpleQuery = await faqsRef.limit(5).get();
    console.log(`Résultats de la requête limitée: ${simpleQuery.docs.length}`);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

testFirestoreConnection();