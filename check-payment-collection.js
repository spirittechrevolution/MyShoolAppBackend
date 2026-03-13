const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'myschool-f862b'
});

const db = admin.firestore();
db.settings({ databaseId: 'myschool-1' });

(async () => {
  try {
    console.log('\n🔍 === Checking Payment Collections ===\n');
    
    // Check 'payments' (plural - correct per code)
    const paymentsSnap = await db.collection('payments').get();
    console.log(`Collection "payments" (plural): ${paymentsSnap.size} documents`);
    if (paymentsSnap.size > 0) {
      console.log('  Found payments:');
      paymentsSnap.forEach(doc => {
        const data = doc.data();
        console.log(`    - ID: ${doc.id}`);
        console.log(`      status: ${data.status}, subscriptionId: ${data.subscriptionId}`);
      });
    }
    
    // Check 'payment' (singular)
    const paymentSnap = await db.collection('payment').get();
    console.log(`\nCollection "payment" (singular): ${paymentSnap.size} documents`);
    if (paymentSnap.size > 0) {
      console.log('  Found payments:');
      paymentSnap.forEach(doc => {
        console.log(`    - ID: ${doc.id}`);
      });
    }
    
    console.log('\n' + '='.repeat(50));
    if (paymentsSnap.size === 0 && paymentSnap.size === 0) {
      console.log('❌ NO PAYMENTS FOUND IN EITHER COLLECTION!');
    } else if (paymentsSnap.size > 0) {
      console.log('✅ Payments are in "payments" (plural) - CORRECT');
    } else {
      console.log('⚠️ Payments are in "payment" (singular) - MISMATCH with code!');
    }
    console.log('='.repeat(50) + '\n');
    
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();
