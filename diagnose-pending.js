const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'myschool-f862b'
});

const db = admin.firestore();
db.settings({ databaseId: 'myschool-1' });

async function diagnosePendingPayments() {
  try {
    console.log('💳 === DIAGNOSTIC: Paiements et abonnements PENDING ===\n');
    
    // 1. Vérifier les abonnements PENDING
    const pendingSubs = await db.collection('subscriptions')
      .where('status', '==', 'PENDING')
      .get();
    
    console.log(`1️⃣  Abonnements PENDING: ${pendingSubs.size}`);
    
    for (let i = 0; i < Math.min(5, pendingSubs.size); i++) {
      const doc = pendingSubs.docs[i];
      const sub = doc.data();
      
      console.log(`\n   Abonnement ${i+1}:`);
      console.log(`   - ID: ${doc.id}`);
      console.log(`   - userId: ${sub.userId}`);
      console.log(`   - classe: ${sub.classe}`);
      console.log(`   - status: ${sub.status}`);
      console.log(`   - createdAt: ${sub.createdAt}`);
      console.log(`   - amount: ${sub.amount} ${sub.currency}`);
      
      // Vérifier les paiements associés
      const payments = await db.collection('payment')
        .where('subscriptionId', '==', doc.id)
        .get();
      
      console.log(`   - Paiements: ${payments.size}`);
      payments.docs.forEach((p) => {
        const pData = p.data();
        console.log(`     • Status: ${pData.status}`);
        console.log(`       CreatedAt: ${pData.createdAt}`);
        console.log(`       Amount: ${pData.amount}`);
      });
      
      // Vérifier l'utilisateur
      try {
        const user = await db.collection('utilisateur').doc(sub.userId).get();
        if (user.exists) {
          const userData = user.data();
          console.log(`   📌 User Status:`);
          console.log(`      - hasActiveSubscription: ${userData.hasActiveSubscription}`);
          console.log(`      - subscriptionStatus: ${userData.subscriptionStatus}`);
          console.log(`      - subscriptionId in user: ${userData.subscriptionId}`);
          if (userData.subscriptionId !== doc.id) {
            console.log(`      ⚠️  MISMATCH: User has different subscriptionId`);
          }
        }
      } catch (e) {
        console.log(`   ❌ Erreur récup user: ${e.message}`);
      }
    }
    
    // 2. Vérifier les paiements PENDING
    console.log('\n\n2️⃣  Paiements PENDING:');
    const pendingPayments = await db.collection('payment')
      .where('status', '==', 'PENDING')
      .get();
    console.log(`   Nombre: ${pendingPayments.size}`);
    
    // 3. Statistiques des paiements
    console.log('\n3️⃣  Statistiques paiements (par statut):');
    const allPayments = await db.collection('payment').get();
    const paymentStats = {};
    allPayments.docs.forEach(doc => {
      const status = doc.data().status;
      paymentStats[status] = (paymentStats[status] || 0) + 1;
    });
    Object.entries(paymentStats).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
  
  process.exit(0);
}

diagnosePendingPayments();
