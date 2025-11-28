const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'myschool-f862b'
});

const db = admin.firestore();
db.settings({
  databaseId: 'myschool-1',
  ignoreUndefinedProperties: true
});

async function getUser() {
  try {
    // Récupérer le premier utilisateur
    const snapshot = await db.collection('utilisateur').limit(1).get();
    
    if (snapshot.empty) {
      console.log('❌ Aucun utilisateur trouvé');
      return;
    }
    
    const doc = snapshot.docs[0];
    const user = doc.data();
    
    console.log('✅ Utilisateur récupéré:\n');
    console.log('ID Document:', doc.id);
    console.log('Données:', JSON.stringify(user, null, 2));
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
  
  process.exit(0);
}

getUser();
