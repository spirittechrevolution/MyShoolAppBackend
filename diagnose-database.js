const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'myschool-f862b'
});

const db = admin.firestore();
db.settings({ databaseId: 'myschool-1' });

async function diagnoseDatabase() {
  try {
    console.log('🔍 === DIAGNOSTIC: État de la base de données ===\n');
    
    // 1. Vérifier les utilisateurs avec subscription
    console.log('1️⃣  Utilisateurs avec hasActiveSubscription=true:');
    const usersWithSub = await db.collection('utilisateur')
      .where('hasActiveSubscription', '==', true)
      .get();
    console.log(`   Nombre: ${usersWithSub.size}`);
    usersWithSub.docs.forEach((doc, idx) => {
      const data = doc.data();
      console.log(`   ${idx+1}. ${data.firstName} ${data.lastName}`);
      console.log(`      - subscriptionStatus: ${data.subscriptionStatus}`);
      console.log(`      - subscriptionEndDate: ${data.subscriptionEndDate}`);
    });
    
    // 2. Vérifier les abonnements ACTIFS
    console.log('\n2️⃣  Abonnements avec status=ACTIVE:');
    const activeSubs = await db.collection('subscriptions')
      .where('status', '==', 'ACTIVE')
      .get();
    console.log(`   Nombre: ${activeSubs.size}`);
    activeSubs.docs.forEach((doc, idx) => {
      const data = doc.data();
      console.log(`   ${idx+1}. ID: ${doc.id}`);
      console.log(`      - userId: ${data.userId}`);
      console.log(`      - classe: ${data.classe}`);
      console.log(`      - typeAbonnement: ${data.typeAbonnement}`);
      console.log(`      - endDate: ${data.endDate}`);
    });
    
    // 3. Vérifier les abonnements au total
    console.log('\n3️⃣  Total abonnements (par statut):');
    const allSubs = await db.collection('subscriptions').get();
    const stats = {};
    allSubs.docs.forEach(doc => {
      const status = doc.data().status;
      stats[status] = (stats[status] || 0) + 1;
    });
    Object.entries(stats).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });
    
    // 4. Vérifier pour un user spécifique
    console.log('\n4️⃣  Details d\'un user (si trouvé):');
    if (usersWithSub.size > 0) {
      const user = usersWithSub.docs[0].data();
      const userId = usersWithSub.docs[0].id;
      console.log(`   ID: ${userId}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   hasActiveSubscription: ${user.hasActiveSubscription}`);
      console.log(`   subscriptionId: ${user.subscriptionId}`);
      
      // Vérifier l'abonnement
      if (user.subscriptionId) {
        try {
          const sub = await db.collection('subscriptions').doc(user.subscriptionId).get();
          console.log(`\n   💾 Abonnement référencé:`);
          console.log(`      - Exists: ${sub.exists ? 'OUI' : 'NON'}`);
          if (sub.exists) {
            console.log(`      - Status: ${sub.data().status}`);
            console.log(`      - EndDate: ${sub.data().endDate}`);
          }
        } catch (e) {
          console.log(`   ❌ Erreur: ${e.message}`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
  
  process.exit(0);
}

diagnoseDatabase();
