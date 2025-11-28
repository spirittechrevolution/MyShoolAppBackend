// Test rapide de connexion Firestore
const admin = require('firebase-admin');

// Initialiser avec le service account
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'myschool-f862b'
});

const db = admin.firestore();

// Configurer les paramètres Firestore
db.settings({
  ignoreUndefinedProperties: true
});

async function testFirestore() {
  try {
    console.log('🔍 Test de connexion Firestore...');
    console.log('📍 Projet:', serviceAccount.project_id);
    console.log('📍 Database ID: (default)');
    
    // Test 1: Lire la collection utilisateur
    console.log('\n📖 Test 1: Lecture de la collection "utilisateur"...');
    const snapshot = await db.collection('utilisateur').limit(1).get();
    console.log(`✅ Collection trouvée! Documents: ${snapshot.size}`);
    
    if (snapshot.size > 0) {
      const doc = snapshot.docs[0];
      console.log('Premier document:', doc.id, JSON.stringify(doc.data(), null, 2));
    }
    
    // Test 2: Créer un document de test
    console.log('\n📝 Test 2: Création d\'un document de test...');
    const testDoc = await db.collection('utilisateur').add({
      firstName: 'Test',
      lastName: 'API',
      phone: '+221771234567',
      createdAt: admin.firestore.Timestamp.now(),
      role: { libelle: 'student' },
      status: 'active',
      level: 'beginner'
    });
    console.log(`✅ Document créé avec l'ID: ${testDoc.id}`);
    
    // Supprimer le document de test
    await testDoc.delete();
    console.log('🗑️  Document de test supprimé');
    
    console.log('\n✅ Tous les tests réussis!');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    console.error('Code:', error.code);
    console.error('Détails:', error.details);
    
    if (error.code === 5) {
      console.error('\n💡 Suggestions:');
      console.error('1. Vérifiez que Firestore est activé dans la console Firebase');
      console.error('2. Vérifiez que le service account a les bonnes permissions');
      console.error('3. La base de données Firestore doit être en mode "Native" (pas Datastore)');
    }
    
    process.exit(1);
  }
}

testFirestore();
