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

async function listAllUsers() {
  try {
    console.log('📋 Liste de TOUS les utilisateurs dans Firestore:\n');
    
    const snapshot = await db.collection('utilisateur').get();
    
    if (snapshot.empty) {
      console.log('❌ Aucun utilisateur trouvé');
      return;
    }
    
    console.log(`✅ ${snapshot.size} utilisateur(s) trouvé(s):\n`);
    
    snapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`${index + 1}. ID: ${doc.id}`);
      console.log(`   Nom: ${data.firstName} ${data.lastName}`);
      console.log(`   Téléphone: ${data.phone}`);
      console.log(`   UID Firebase Auth: ${data.uid}`);
      console.log(`   Rôle: ${data.role?.libelle || 'N/A'}`);
      console.log(`   Statut: ${data.status}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
  
  process.exit(0);
}

listAllUsers();
