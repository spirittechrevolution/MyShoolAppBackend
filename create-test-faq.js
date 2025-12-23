/**
 * Script pour créer un document FAQ de test
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

async function createTestFAQ() {
  console.log('📝 Création d\'une FAQ de test...');
  
  try {
    const testFAQ = {
      question: "Comment obtenir mon certificat ?",
      answer: "Pour obtenir votre certificat, vous devez compléter tous les chapitres du cours et réussir l'évaluation finale avec au moins 70% de réussite.",
      category: "certificates",
      order: 1,
      isActive: true,
      tags: ["certificat", "évaluation", "cours"],
      views: 0,
      helpful: 0,
      notHelpful: 0,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    };

    const docRef = await db.collection('faqs').add(testFAQ);
    console.log(`✅ FAQ créée avec l'ID: ${docRef.id}`);
    
    // Vérifier que le document a été créé
    const doc = await docRef.get();
    if (doc.exists) {
      console.log('✅ Document confirmé créé:', doc.data());
    }
    
  } catch (error) {
    console.error('❌ Erreur création FAQ:', error);
  }
}

createTestFAQ();