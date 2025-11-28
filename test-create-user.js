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

async function testCreateUser() {
  try {
    console.log('🔍 Test de création d\'utilisateur...\n');
    
    // 1. Créer l'utilisateur Firebase Auth
    console.log('1️⃣ Création dans Firebase Auth...');
    const userRecord = await admin.auth().createUser({
      phoneNumber: '+221783703310',
      password: 'Test1234',
      displayName: 'Test Simple'
    });
    
    console.log('✅ Utilisateur Auth créé:', userRecord.uid);
    
    // 2. Créer le document dans Firestore
    console.log('\n2️⃣ Création dans Firestore collection "utilisateur"...');
    const userData = {
      uid: userRecord.uid,
      firstName: 'Test',
      lastName: 'Simple',
      phone: '+221783703310',
      level: 'beginner',
      login: '+221783703310',
      role: { libelle: 'student' },
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      specializationId: null
    };
    
    const docRef = await db.collection('utilisateur').add(userData);
    console.log('✅ Document Firestore créé avec ID:', docRef.id);
    
    // 3. Vérifier que l'utilisateur existe bien
    console.log('\n3️⃣ Vérification dans Firestore...');
    const snapshot = await db.collection('utilisateur')
      .where('phone', '==', '+221783703310')
      .get();
    
    if (snapshot.empty) {
      console.log('❌ PROBLÈME: Utilisateur non trouvé après création !');
    } else {
      console.log('✅ Utilisateur trouvé:', snapshot.docs[0].data());
    }
    
    // 4. Lister tous les utilisateurs
    console.log('\n4️⃣ Liste de TOUS les utilisateurs:');
    const allUsers = await db.collection('utilisateur').get();
    console.log(`Total: ${allUsers.size} utilisateur(s)`);
    allUsers.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`   ${index + 1}. ${data.firstName} ${data.lastName} (${data.phone})`);
    });
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    if (error.code) {
      console.error('Code:', error.code);
    }
    process.exit(1);
  }
}

testCreateUser();
