const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'myschool-f862b'
});

const db = admin.firestore();
db.settings({ databaseId: 'myschool-1' });

async function fixMatiereNames() {
  try {
    console.log('🔧 === CORRECTION DES NOMS DE MATIÈRES ===\n');
    
    // Récupérer toutes les matières
    const matieresSnap = await db.collection('matieres').get();
    
    let totalFixed = 0;
    
    // Chercher les matières avec des espaces inutiles
    const problematicMatieres = [];
    
    for (const doc of matieresSnap.docs) {
      const data = doc.data();
      const originalNom = data.nom;
      const trimmedNom = originalNom.trim();
      
      if (originalNom !== trimmedNom) {
        problematicMatieres.push({
          id: doc.id,
          original: originalNom,
          fixed: trimmedNom,
          classe: data.classe
        });
      }
    }
    
    console.log(`Trouvé ${problematicMatieres.length} matière(s) avec espaces inutiles:\n`);
    
    for (const matiere of problematicMatieres) {
      console.log(`❌ AVANT: "${matiere.original}" (${matiere.classe})`);
      console.log(`✅ APRÈS: "${matiere.fixed}" (${matiere.classe})`);
      
      await db.collection('matieres').doc(matiere.id).update({
        nom: matiere.fixed
      });
      
      totalFixed++;
      console.log('   → Corrigé\n');
    }
    
    console.log(`\n✅ === CORRECTION TERMINÉE ===`);
    console.log(`Total matières corrigées: ${totalFixed}`);
    
    if (totalFixed > 0) {
      console.log('\n📝 Vérification post-correction:');
      const matieresAfter = await db.collection('matieres')
        .where('niveauScolaire', '==', 'SECONDAIRE')
        .get();
      
      const byClasse = {};
      matieresAfter.forEach(doc => {
        const data = doc.data();
        if (!byClasse[data.classe]) {
          byClasse[data.classe] = [];
        }
        byClasse[data.classe].push(data.nom);
      });
      
      const sortedClasses = Object.keys(byClasse).sort();
      sortedClasses.forEach(classe => {
        console.log(`\n${classe}:`);
        byClasse[classe].forEach(m => console.log(`  - "${m}"`));
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
  
  process.exit(0);
}

fixMatiereNames();
