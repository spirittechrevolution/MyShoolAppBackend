const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'myschool-f862b'
});

const db = admin.firestore();
db.settings({ databaseId: 'myschool-1' });

async function checkAll() {
  try {
    console.log('🔍 Tous les paiements et subscriptions...\n');
    
    const paymentDocs = await db.collection('payment').get();
    
    console.log(`📋 PAIEMENTS (${paymentDocs.size}):`);
    paymentDocs.forEach(doc => {
      const data = doc.data();
      console.log(`\n- ID: ${doc.id}`);
      console.log(`  Status: ${data.status}`);
      console.log(`  Type: ${data.paymentType}`);
      console.log(`  WavePaymentId: ${data.metadata?.wavePaymentId}`);
      console.log(`  SubscriptionId: ${data.subscriptionId}`);
      console.log(`  CreatedAt: ${data.createdAt}`);
    });
    
    console.log('\n\n');
    const subDocs = await db.collection('subscription').get();
    
    console.log(`🎓 SUBSCRIPTIONS (${subDocs.size}):`);
    subDocs.forEach(doc => {
      const data = doc.data();
      console.log(`\n- ID: ${doc.id}`);
      console.log(`  Status: ${data.status}`);
      console.log(`  UserId: ${data.userId}`);
      console.log(`  PaymentId: ${data.paymentId}`);
      console.log(`  StartDate: ${data.startDate}`);
      console.log(`  EndDate: ${data.endDate}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    process.exit(0);
  }
}

checkAll();
