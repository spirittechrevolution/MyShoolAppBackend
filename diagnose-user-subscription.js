/**
 * Script de diagnostic pour vérifier l'état d'un utilisateur et son abonnement
 * Usage: node diagnose-user-subscription.js userId@email.com
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialiser Firebase avec la bonne base de données
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'myschool-f862b'
});

const db = admin.firestore();
db.settings({ databaseId: 'myschool-1' });

async function diagnoseUser(userEmail) {
  console.log('\n' + '='.repeat(80));
  console.log(`🔍 DIAGNOSTIC UTILISATEUR: ${userEmail}`);
  console.log('='.repeat(80) + '\n');

  try {
    // 1. Chercher l'utilisateur dans Firebase Auth
    console.log('1️⃣  Recherche dans Firebase Auth...');
    let userRecord;
    try {
      userRecord = await admin.auth().getUserByEmail(userEmail);
      console.log(`   ✅ Utilisateur trouvé: ${userRecord.uid}`);
    } catch (error) {
      console.log(`   ❌ Utilisateur non trouvé dans Firebase Auth: ${error.message}`);
      return;
    }

    const userId = userRecord.uid;

    // 2. Vérifier le document utilisateur dans Firestore
    console.log('\n2️⃣  Recherche du document utilisateur dans Firestore...');
    const userDoc = await db.collection('utilisateur').doc(userId).get();
    
    if (!userDoc.exists) {
      console.log('   ❌ Document utilisateur non trouvé dans Firestore');
      return;
    }

    const userData = userDoc.data();
    console.log('   ✅ Document utilisateur trouvé:');
    console.log(`      - Nom: ${userData.firstName} ${userData.lastName}`);
    console.log(`      - Classe: ${userData.classe || 'N/A'}`);
    console.log(`      - Niveau: ${userData.niveauScolaire || 'N/A'}`);
    console.log(`      - hasActiveSubscription: ${userData.hasActiveSubscription}`);
    console.log(`      - subscriptionStatus: ${userData.subscriptionStatus || 'N/A'}`);
    console.log(`      - subscriptionId: ${userData.subscriptionId || 'N/A'}`);
    console.log(`      - subscriptionEndDate: ${userData.subscriptionEndDate ? new Date(userData.subscriptionEndDate.toDate()).toLocaleString() : 'N/A'}`);

    // 3. Chercher les subscriptions
    console.log('\n3️⃣  Recherche des subscriptions...');
    const subsSnapshot = await db.collection('subscriptions')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    if (subsSnapshot.empty) {
      console.log('   ❌ Aucune subscription trouvée');
    } else {
      console.log(`   ✅ ${subsSnapshot.size} subscription(s) trouvée(s):`);
      
      for (const subDoc of subsSnapshot.docs) {
        const sub = subDoc.data();
        console.log(`\n      📋 Subscription ${subDoc.id}:`);
        console.log(`         - Status: ${sub.status}`);
        console.log(`         - TypeAbonnement: ${sub.typeAbonnement}`);
        console.log(`         - Classe: ${sub.classe}`);
        console.log(`         - NiveauScolaire: ${sub.niveauScolaire}`);
        console.log(`         - Matières: ${sub.matieres ? sub.matieres.join(', ') : 'N/A'}`);
        console.log(`         - CreatedAt: ${new Date(sub.createdAt.toDate()).toLocaleString()}`);
        if (sub.startDate) console.log(`         - StartDate: ${new Date(sub.startDate.toDate()).toLocaleString()}`);
        if (sub.endDate) console.log(`         - EndDate: ${new Date(sub.endDate.toDate()).toLocaleString()}`);
        if (sub.paymentId) console.log(`         - PaymentId: ${sub.paymentId}`);

        // 4. Chercher le paiement associé
        console.log(`\n         💳 Paiements associés...`);
        const paymentsSnapshot = await db.collection('payments')
          .where('subscriptionId', '==', subDoc.id)
          .orderBy('createdAt', 'desc')
          .get();

        if (paymentsSnapshot.empty) {
          console.log(`            ❌ Aucun paiement trouvé`);
        } else {
          console.log(`            ✅ ${paymentsSnapshot.size} paiement(s):`);
          
          for (const payDoc of paymentsSnapshot.docs) {
            const pay = payDoc.data();
            console.log(`\n            📄 Payment ${payDoc.id}:`);
            console.log(`               - Status: ${pay.status}`);
            console.log(`               - Amount: ${pay.amount} ${pay.currency}`);
            console.log(`               - CreatedAt: ${new Date(pay.createdAt.toDate()).toLocaleString()}`);
            if (pay.wavePaymentId) console.log(`               - WavePaymentId: ${pay.wavePaymentId}`);
            if (pay.metadata) console.log(`               - Metadata.type: ${pay.metadata.type || 'N/A'}`);
          }
        }
      }
    }

    // 5. Chercher les courses
    console.log('\n4️⃣  Recherche des courses disponibles...');
    const coursesSnapshot = await db.collection('courses')
      .where('isPublished', '==', true)
      .limit(3)
      .get();

    if (!coursesSnapshot.empty) {
      const firstCourse = coursesSnapshot.docs[0].data();
      console.log(`   📚 Exemple de course: ${firstCourse.title || 'N/A'}`);
      console.log(`      - Classe: ${firstCourse.classe}`);
      console.log(`      - NiveauScolaire: ${firstCourse.niveauScolaire}`);
      console.log(`      - MatiereId: ${firstCourse.matiereId}`);
    }

    // 6. RÉSUMÉ ET DIAGNOSTIC
    console.log('\n' + '='.repeat(80));
    console.log('📊 RÉSUMÉ ET DIAGNOSTIC');
    console.log('='.repeat(80));

    if (!subsSnapshot.empty) {
      const latestSub = subsSnapshot.docs[0].data();
      
      if (latestSub.status === 'ACTIVE') {
        console.log('✅ STATUT: Abonnement ACTIF');
        console.log('   Les cours devraient être débloqués!');
        console.log('   → Si toujours bloqués, vérifier les matières/classe');
      } else if (latestSub.status === 'PENDING') {
        console.log('⏳ STATUT: Abonnement PENDING (en attente de confirmation)');
        
        // Chercher un paiement SUCCESS
        const paySuccess = await db.collection('payments')
          .where('subscriptionId', '==', subsSnapshot.docs[0].id)
          .where('status', '==', 'SUCCESS')
          .get();

        if (!paySuccess.empty) {
          console.log('   ✅ MAIS: Un paiement SUCCESS existe!');
          console.log('   → getAccessibleSubscription() DEVRAIT donner accès');
          console.log('   → Si toujours bloqués, vérifier que le code est déployé');
        } else {
          console.log('   ❌ Aucun paiement SUCCESS trouvé');
          console.log('   → L\'abonnement attend la confirmation du paiement');
        }
      } else if (latestSub.status === 'EXPIRED') {
        console.log('⏰ STATUT: Abonnement EXPIRÉ');
        console.log('   → Courses bloquées (abonnement expiré)');
      }
    } else {
      console.log('❌ STATUT: Aucun abonnement!');
      console.log('   → Courses bloquées (pas d\'abonnement)');
    }

    console.log('\n' + '='.repeat(80) + '\n');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error);
  } finally {
    process.exit(0);
  }
}

// Récupérer l'email depuis les arguments
const userEmail = process.argv[2];

if (!userEmail) {
  console.log('Usage: node diagnose-user-subscription.js email@example.com');
  process.exit(1);
}

diagnoseUser(userEmail);
