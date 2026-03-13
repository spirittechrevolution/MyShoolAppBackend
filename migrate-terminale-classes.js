const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'myschool-f862b'
});

const db = admin.firestore();
db.settings({ databaseId: 'myschool-1' });

// Mapping ancien → nouveau
const CLASS_MAPPING = {
  'Terminale L\'': 'Terminale L1',
  'Terminale L': 'Terminale L2',
  'Terminale S': 'Terminale S1'
  // G et T restent inchangées
};

async function migrateClasses() {
  try {
    console.log('🔄 === MIGRATION DES CLASSES SECONDAIRE ===\n');
    
    let totalUpdated = 0;
    
    for (const [oldClass, newClass] of Object.entries(CLASS_MAPPING)) {
      console.log(`\n📝 Migrant: "${oldClass}" → "${newClass}"`);
      
      // Récupérer les matières avec l'ancienne classe
      const matieresSnap = await db.collection('matieres')
        .where('niveauScolaire', '==', 'SECONDAIRE')
        .where('classe', '==', oldClass)
        .get();
      
      console.log(`   Trouvé: ${matieresSnap.size} matière(s)`);
      
      for (const doc of matieresSnap.docs) {
        await doc.ref.update({ classe: newClass });
        console.log(`   ✅ ${doc.data().nom} → ${newClass}`);
        totalUpdated++;
      }
    }
    
    console.log(`\n\n✅ === MIGRATION COMPLÉTÉE ===`);
    console.log(`Total matières mises à jour: ${totalUpdated}`);
    
    // Vérifier le résultat - SANS orderBy pour éviter l'index composite
    console.log('\n📋 === RÉSULTAT FINAL ===\n');
    
    const matieresSnap = await db.collection('matieres')
      .where('niveauScolaire', '==', 'SECONDAIRE')
      .get();
    
    const byClasse = {};
    matieresSnap.forEach(doc => {
      const data = doc.data();
      if (!byClasse[data.classe]) {
        byClasse[data.classe] = [];
      }
      byClasse[data.classe].push(data.nom);
    });
    
    // Trier les classes en JavaScript
    const sortedClasses = Object.keys(byClasse).sort();
    for (const classe of sortedClasses) {
      console.log(`${classe}: ${byClasse[classe].length} matière(s)`);
      byClasse[classe].forEach(m => console.log(`  - ${m}`));
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
  
  process.exit(0);
}

migrateClasses();
