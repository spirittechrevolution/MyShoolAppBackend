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
    console.log('🔍 Cherchant TOUS les paiements...\n');
    
    // Récupérer tous les documents payment
    const allPayments = await db.collection('payment')
      .get();
    
    console.log(`Total paiements: ${allPayments.size}\n`);
    
    if (allPayments.size === 0) {
      console.log('❌ AUCUN paiement trouvé dans la collection!');
    } else {
      console.log('📋 Paiements disponibles:');
      allPayments.forEach(doc => {
        const data = doc.data();
        console.log(`\n ID: ${doc.id}`);
        console.log(` Status: ${data.status}`);
        console.log(` Type: ${data.paymentType}`);
        console.log(` User: ${data.userId}`);
        
        // Chercher pour la wave ID
        if (data.metadata?.wavePaymentId) {
          console.log(` WavePaymentId: ${data.metadata.wavePaymentId}`);
          if (data.metadata.wavePaymentId === 'cos-23kxxqvg01hmg') {
            console.log(' ✅ <--- C\'EST LE NÔTRE!');
          }
        }
      });
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    process.exit(0);
  }
}

checkPayment();
