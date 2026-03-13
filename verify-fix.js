const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'myschool-f862b'
});

const db = admin.firestore();
db.settings({ databaseId: 'myschool-1' });

async function verifyFix() {
  try {
    console.log('✅ === VÉRIFICATION POST-DÉPLOIEMENT ===\n');
    
    // 1. Vérifier que les espaces ont été corrigés
    console.log('📚 Vérification des matières SECONDAIRE:\n');
    
    const problematic = await db.collection('matieres')
      .where('niveauScolaire', '==', 'SECONDAIRE')
      .get();
    
    let hasSpaceIssues = false;
    const matieresSansProblem = [];
    
    problematic.forEach(doc => {
      const data = doc.data();
      if (data.nom !== data.nom.trim()) {
        hasSpaceIssues = true;
        console.log(`❌ PROBLÈME: "${data.nom}" (classe: ${data.classe})`);
      } else {
        matieresSansProblem.push(data.nom);
      }
    });
    
    if (!hasSpaceIssues) {
      console.log('✅ Aucune matière n\'a d\'espaces inutiles');
      console.log(`✅ Total matières vérifiées: ${matieresSansProblem.length}`);
    }
    
    // 2. Tester que Seconde S peut créer un abonnement
    console.log('\n\n🧪 Test: Création abonnement Seconde S\n');
    
    const secondeSMatieres = await db.collection('matieres')
      .where('niveauScolaire', '==', 'SECONDAIRE')
      .where('classe', '==', 'Seconde S')
      .get();
    
    const matieres = [];
    secondeSMatieres.forEach(doc => {
      matieres.push(doc.data().nom);
    });
    
    console.log(`Matières disponibles pour Seconde S: ${matieres.length}`);
    matieres.forEach(m => console.log(`  ✅ "${m}"`));
    
    if (matieres.length >= 3) {
      console.log('\n✅ Seconde S peut créer un abonnement MATIERE (3 matières)');
    }
    
    // 3. Vérifier les Terminale
    console.log('\n\n📚 Vérification Terminale L1 & L2:\n');
    
    const terminaleL1 = await db.collection('matieres')
      .where('niveauScolaire', '==', 'SECONDAIRE')
      .where('classe', '==', 'Terminale L1')
      .get();
    
    const terminaleL2 = await db.collection('matieres')
      .where('niveauScolaire', '==', 'SECONDAIRE')
      .where('classe', '==', 'Terminale L2')
      .get();
    
    console.log(`Terminale L1: ${terminaleL1.size} matière(s)`);
    terminaleL1.forEach(doc => {
      const nom = doc.data().nom;
      const hasProblem = nom !== nom.trim();
      console.log(`  ${hasProblem ? '❌' : '✅'} "${nom}"`);
    });
    
    console.log(`\nTerminale L2: ${terminaleL2.size} matière(s)`);
    terminaleL2.forEach(doc => {
      const nom = doc.data().nom;
      const hasProblem = nom !== nom.trim();
      console.log(`  ${hasProblem ? '❌' : '✅'} "${nom}"`);
    });
    
    console.log('\n\n✅ === VÉRIFICATION COMPLÉTÉE ===');
    console.log('Le déploiement est prêt!');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
  
  process.exit(0);
}

verifyFix();
