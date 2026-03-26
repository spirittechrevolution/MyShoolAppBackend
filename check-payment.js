const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'myschool-f862b'
});

const db = admin.firestore();
db.settings({ databaseId: 'myschool-1' });

async function checkPayment() {
  try {
    // Chercher le paiement par Wave ID
    const snapshot = await db.collection('payment')
      .where('metadata.wavePaymentId', '==', 'cos-23kxxqvg01hmg')
      .get();
    
    if (snapshot.empty) {
      console.log('❌ Paiement NOT found avec wavePaymentId: cos-23kxxqvg01hmg');
      
      // Essayer les derniers paiements Wave pour voir quoi
      const allPayments = await db.collection('payment')
        .where('paymentMethod', '==', 'wave')
        .orderBy('createdAt', 'desc')
        .limit(5)
        .get();
      
      console.log('\n📋 Derniers paiements Wave:');
      allPayments.forEach(doc => {
        console.log(`\nID: ${doc.id}`);
        console.log('Status:', doc.data().status);
        console.log('Type:', doc.data().paymentType);
        console.log('WavePaymentId:', doc.data().metadata?.wavePaymentId);
      });
    } else {
      console.log('✅ Paiement TROUVÉ!');
      snapshot.forEach(doc => {
        console.log(`\nID: ${doc.id}`);
        const data = doc.data();
        console.log('Status:', data.status);
        console.log('Type:', data.paymentType);
        console.log('UserId:', data.userId);
        console.log('Amount:', data.amount);
        console.log('CreatedAt:', data.createdAt);
        console.log('UpdatedAt:', data.updatedAt);
      });
    }
  } catch (error) {
    console.error('Erreur:', error.message);
  } finally {
    process.exit(0);
  }
}

checkPayment();
