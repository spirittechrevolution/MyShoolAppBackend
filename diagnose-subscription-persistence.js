const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'myschool-f862b'
});

const db = admin.firestore();
db.settings({ databaseId: 'myschool-1' });

async function diagnoseSubscriptionPersistence() {
  try {
    console.log('🧪 === DIAGNOSTIC: Persistance d\'abonnement après reconnexion ===\n');
    
    // Finder un utilisateur avec un abonnement actif
    const usersSnapshot = await db.collection('utilisateur')
      .where('hasActiveSubscription', '==', true)
      .limit(1)
      .get();
    
    if (usersSnapshot.empty) {
      console.log('❌ Aucun utilisateur avec abonnement actif trouvé');
      return;
    }
    
    const userDoc = usersSnapshot.docs[0];
    const userId = userDoc.id;
    const userData = userDoc.data();
    
    console.log('👤 Utilisateur trouvé:');
    console.log(`   ID: ${userId}`);
    console.log(`   hasActiveSubscription (user): ${userData.hasActiveSubscription}`);
    console.log(`   subscriptionId: ${userData.subscriptionId}`);
    console.log(`   subscriptionStatus: ${userData.subscriptionStatus}`);
    console.log(`   subscriptionEndDate: ${userData.subscriptionEndDate}`);
    console.log(`   classe: ${userData.classe}`);
    console.log(`   niveauScolaire: ${userData.niveauScolaire}\n`);
    
    // Vérifier l'abonnement réel dans la collection subscriptions
    if (userData.subscriptionId) {
      const subDoc = await db.collection('subscriptions')
        .doc(userData.subscriptionId)
        .get();
      
      if (!subDoc.exists) {
        console.log(`❌ PROBLÈME: Abonnement ${userData.subscriptionId} not found in subscriptions collection!`);
      } else {
        const subData = subDoc.data();
        console.log('📋 Vérification abonnement dans subscriptions collection:');
        console.log(`   ID: ${subDoc.id}`);
        console.log(`   status: ${subData.status}`);
        console.log(`   userId: ${subData.userId}`);
        console.log(`   classe: ${subData.classe}`);
        console.log(`   typeAbonnement: ${subData.typeAbonnement}`);
        console.log(`   startDate: ${subData.startDate}`);
        console.log(`   endDate: ${subData.endDate}`);
        console.log(`   niveauScolaire: ${subData.niveauScolaire}`);
        
        // Vérifier si l'abonnement est expiré
        const now = new Date();
        const endDate = subData.endDate?.toDate ? subData.endDate.toDate() : new Date(subData.endDate);
        const isExpired = endDate < now;
        
        console.log(`\n⏰ Vérification expiration:`);
        console.log(`   Maintenant: ${now.toISOString()}`);
        console.log(`   Date fin: ${endDate.toISOString()}`);
        console.log(`   Expiré: ${isExpired ? '✅ OUI (problème!)' : '❌ NON'}`);
        
        // Vérifier la cohérence entre user doc et subscription doc
        if (userData.subscriptionStatus !== subData.status) {
          console.log(`\n⚠️  INCOHÉRENCE: subscriptionStatus`);
          console.log(`   user.subscriptionStatus: ${userData.subscriptionStatus}`);
          console.log(`   subscription.status: ${subData.status}`);
        }
        
        if (userData.subscriptionStatus === 'ACTIVE' && isExpired) {
          console.log(`\n🔴 PROBLÈME CRITIQUE: L'abonnement est marqué ACTIVE mais est expiré!`);
          console.log(`   Le user document ne sera pas mis à jour automatiquement.`);
          console.log(`   L'utilisateur restera bloqué avec hasActiveSubscription=true`);
        }
      }
    }
    
    // Test de vérification d'accès
    console.log('\n\n🔐 Test de vérification d\'accès (simulation):');
    const activeSubSnapshot = await db.collection('subscriptions')
      .where('userId', '==', userId)
      .where('status', '==', 'ACTIVE')
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();
    
    if (activeSubSnapshot.empty) {
      console.log('❌ getActiveSubscription() retournerait NULL');
      console.log('   → L\'utilisateur n\'aurait PAS accès aux cours');
    } else {
      console.log('✅ getActiveSubscription() retournerait l\'abonnement');
      console.log('   → L\'utilisateur aurait accès aux cours');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
  
  process.exit(0);
}

diagnoseSubscriptionPersistence();
