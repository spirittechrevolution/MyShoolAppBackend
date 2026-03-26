const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'myschool-f862b'
});

const db = admin.firestore();
// Essayer SANS spécifier de databaseId (utilise la default)
// db.settings({ databaseId: 'myschool-1' });

async function search() {
  try {
    const userId = 'pxMlPBgyTv7iZaNVXVg1';
    
    console.log('🔍 Cherchant subscriptions dans la DEFAULT database...\n');
    
    const subs = await db.collection('subscription')
      .where('userId', '==', userId)
      .get();
    
    console.log(`Subscriptions trouvées: ${subs.size}\n`);
    
    if (subs.size > 0) {
      subs.forEach(doc => {
        const data = doc.data();
        console.log(`✅ ID: ${doc.id}`);
        console.log(`   Status: ${data.status}`);
        console.log(`   PaymentId: ${data.paymentId}`);
        console.log('---');
      });
    } else {
      console.log('❌ Aucune subscription trouvée');
      console.log('\n 📋 Essayons de lire TOUS les documents subscription...\n');
      
      const all = await db.collection('subscription').limit(5).get();
      console.log(`Total documents subscription: ${all.size}`);
      all.forEach(doc => {
        console.log(`- ${doc.id}`);
      });
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    process.exit(0);
  }
}

search();
