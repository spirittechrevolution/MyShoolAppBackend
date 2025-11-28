const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialiser avec le bon database ID
const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'myschool-f862b'
});

async function listDatabases() {
  try {
    console.log('🔍 Recherche des bases de données Firestore...\n');
    
    // Essayer d'accéder à la base "myschool-1" (découverte via l'API)
    const db = admin.firestore();
    
    // Configuration pour utiliser "myschool-1" au lieu de "(default)"
    db.settings({
      databaseId: 'myschool-1',
      ignoreUndefinedProperties: true
    });
    
    console.log('Tentative: Base de données "myschool-1"');
    try {
      const collections = await db.listCollections();
      console.log('✅ Collections trouvées:', collections.map(c => c.id).join(', '));
      
      // Tester la lecture de utilisateur
      const snapshot = await db.collection('utilisateur').limit(1).get();
      console.log(`✅ Collection "utilisateur": ${snapshot.size} document(s)`);
      
      if (snapshot.size > 0) {
        console.log('Premier utilisateur:', snapshot.docs[0].data());
      }
      
      process.exit(0);
    } catch (error) {
      console.log(`❌ Erreur: ${error.message} (Code: ${error.code})\n`);
    }
    
    // Si la base par défaut ne fonctionne pas, essayer avec un database ID différent
    console.log('Le problème peut venir de:');
    console.log('1. La base de données Firestore n\'est pas encore créée');
    console.log('2. Le service account n\'a pas les permissions nécessaires');
    console.log('3. Vous utilisez Datastore au lieu de Firestore Native mode');
    console.log('\nAllez sur: https://console.firebase.google.com/project/myschool-f862b/firestore');
    console.log('Vérifiez que vous voyez bien vos collections (utilisateur, courses, etc.)');
    
  } catch (error) {
    console.error('❌ Erreur globale:', error);
  }
  
  process.exit(1);
}

listDatabases();
