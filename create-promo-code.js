const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'myschool-f862b'
});

const db = admin.firestore();
db.settings({ databaseId: 'myschool-1' });

async function createPromoCode() {
  try {
    console.log('💳 Création du code promo...\n');
    
    // Code promo avec 10% de réduction
    const promoCode = {
      code: 'REDUCTION10',
      discountType: 'percentage',
      discountValue: 10, // 10% = 500 FCFA sur 5000
      expiresAt: new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000), // 1 an
      maxUsage: 1000, // Limite d'utilisation
      usageCount: 0,
      isActive: true,
      createdAt: new Date(),
      description: 'Code promo 10% de réduction sur abonnement'
    };
    
    // Créer ou mettre à jour
    await db.collection('promoCodes').doc('REDUCTION10').set(promoCode, { merge: true });
    
    console.log('✅ Code promo créé avec succès:\n');
    console.log('Code: REDUCTION10');
    console.log('Réduction: 10% (500 FCFA sur 5000)');
    console.log('Prix final: 4500 FCFA');
    console.log('Expire: ' + new Date(promoCode.expiresAt).toLocaleDateString('fr-FR'));
    console.log('Limite: ' + promoCode.maxUsage + ' utilisations');
    console.log('\n✅ Le code promo est maintenant actif!');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
  
  process.exit(0);
}

createPromoCode();
