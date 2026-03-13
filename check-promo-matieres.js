const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'myschool-f862b'
});

const db = admin.firestore();
db.settings({ databaseId: 'myschool-1' });

async function checkData() {
  console.log('\n📚 === VÉRIFICATION DES MATIÈRES ===\n');
  
  try {
    // Récupérer toutes les matières
    const matieresSnap = await db.collection('matieres').get();
    console.log(`Total matières: ${matieresSnap.size}`);
    
    const levels = {};
    matieresSnap.forEach(doc => {
      const data = doc.data();
      const level = data.niveauScolaire || 'UNDEFINED';
      if (!levels[level]) levels[level] = [];
      levels[level].push({
        nom: data.nom,
        classe: data.classe,
        isActive: data.isActive
      });
    });
    
    for (const [level, matieres] of Object.entries(levels)) {
      console.log(`\n${level}:`);
      matieres.forEach(m => {
        console.log(`  - ${m.nom} (classe: ${m.classe}, active: ${m.isActive})`);
      });
    }
  } catch (e) {
    console.error('Erreur matières:', e.message);
  }

  console.log('\n\n💳 === VÉRIFICATION DES CODES PROMO ===\n');
  
  try {
    // Récupérer tous les codes promo
    const promoSnap = await db.collection('promoCodes').get();
    console.log(`Total codes promo: ${promoSnap.size}`);
    
    if (promoSnap.empty) {
      console.log('⚠️  Aucun code promo trouvé!');
    } else {
      promoSnap.forEach(doc => {
        const data = doc.data();
        const reduction = data.discountType === 'percentage' 
          ? `${data.discountValue}%`
          : `${data.discountValue} FCFA`;
        console.log(`\n${data.code}:`);
        console.log(`  - Réduction: ${reduction}`);
        console.log(`  - Actif: ${data.isActive}`);
        console.log(`  - Expire: ${new Date(data.expiresAt.toDate()).toLocaleDateString()}`);
        console.log(`  - Usage: ${data.usageCount}/${data.maxUsage}`);
      });
    }
  } catch (e) {
    console.error('Erreur codes promo:', e.message);
  }
  
  console.log('\n\n📊 === PRIX ACTUELS ===\n');
  console.log('Prix abonnement: 5000 FCFA');
  console.log('Prix avec réduction 10%: 4500 FCFA');
  
  process.exit(0);
}

checkData().catch(e => {
  console.error('Erreur:', e);
  process.exit(1);
});
