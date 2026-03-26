const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'myschool-f862b'
});

const db = admin.firestore();
db.settings({ databaseId: 'myschool-1' });

async function createCorrectlyStructuredPayment() {
  try {
    const userId = 'pxMlPBgyTv7iZaNVXVg1';
    // Générer un nouveau Wave payment ID unique
    const wavePaymentId = 'cos-' + Date.now() + '-correct';
    
    console.log('📝 Création du paiement avec structure CORRECTE...\n');
    console.log(`Wave Payment ID: ${wavePaymentId}\n`);
    
    // 1. Créer la subscription
    const subscriptionData = {
      userId: userId,
      status: 'PENDING',
      niveauScolaire: 'SECONDAIRE',
      typeAbonnement: 'MATIERE',
      classe: 'Terminale L1',
      matieres: ['Anglais', 'Histoire & Géographie', 'Français'],
      amount: 5000,
      currency: 'XOF',
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const subRef = await db.collection('subscription').add(subscriptionData);
    const subscriptionId = subRef.id;
    console.log(`✅ Subscription créée: ${subscriptionId}`);
    
    // 2. Créer le paiement avec wavePaymentId au niveau TOP du document
    const paymentData = {
      userId: userId,
      paymentType: 'subscription',
      subscriptionId: subscriptionId,
      typeAbonnement: 'MATIERE',
      amount: 5000,
      currency: 'XOF',
      paymentMethod: 'wave',
      status: 'PENDING',
      // ✅ IMPORTANT: wavePaymentId au niveau TOP pour faciliter les requêtes Firestore
      wavePaymentId: wavePaymentId,
      // metadata peut rester aussi
      metadata: {
        checkoutUrl: 'https://pay.wave.com/checkout/...',
        classe: 'Terminale L1',
        typeAbonnement: 'MATIERE',
        matieres: ['Anglais', 'Histoire & Géographie', 'Français']
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const payRef = await db.collection('payment').add(paymentData);
    const paymentDocId = payRef.id;
    console.log(`✅ Payment créée: ${paymentDocId}`);
    
    // 3. Lier le paiement à la subscription
    await db.collection('subscription').doc(subscriptionId).update({
      paymentId: wavePaymentId
    });
    console.log(`✅ Subscription liée au paiement`);
    
    console.log('\n✅ Données créées avec succès!');
    console.log(`\n📋 Résumé:`);
    console.log(`- User ID: ${userId}`);  
    console.log(`- Payment ID (Firestore): ${paymentDocId}`);
    console.log(`- Wave Payment ID: ${wavePaymentId}`);
    console.log(`- Subscription ID: ${subscriptionId}`);
    console.log(`\n🧪 Teste le webhook avec:`);
    console.log(`curl.exe -X POST https://us-central1-myschool-f862b.cloudfunctions.net/api/wave/test-confirm/${wavePaymentId}`);
    console.log(`\n✅ Wave ID pour les tests: ${wavePaymentId}`);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    process.exit(0);
  }
}

createCorrectlyStructuredPayment();
