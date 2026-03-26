const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'myschool-f862b'
});

const db = admin.firestore();
db.settings({ databaseId: 'myschool-1' });

async function checkSubscription() {
  try {
    const userId = 'pxMlPBgyTv7iZaNVXVg1';
    
    console.log(`🔍 Cherchant subscriptions pour user: ${userId}\n`);
    
    // Récupérer toutes les subscriptions du user
    const subs = await db.collection('subscription')
      .where('userId', '==', userId)
      .get();
    
    console.log(`Subscriptions trouvées: ${subs.size}\n`);
    
    subs.forEach(doc => {
      const data = doc.data();
      console.log(`ID: ${doc.id}`);
      console.log(`Status: ${data.status}`);
      console.log(`PaymentId: ${data.paymentId}`);
      console.log(`CreatedAt: ${data.createdAt}`);
      console.log(`StartDate: ${data.startDate}`);
      console.log(`EndDate: ${data.endDate}`);
      console.log('---');
    });
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    process.exit(0);
  }
}

checkSubscription();
