const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'myschool-f862b'
});

const db = admin.firestore();
db.settings({ databaseId: 'myschool-1' });

async function checkSecondaire() {
  try {
    console.log('👣 === MATIÈRES SECONDAIRE ACTUELLES ===\n');
    
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
    
    console.log('Classes actuelles avec matières:');
    for (const [classe, matieres] of Object.entries(byClasse)) {
      console.log(`\n${classe}:`);
      matieres.forEach(m => console.log(`  - ${m}`));
    }
    
    console.log('\n\n📋 === MAPPING PROPOSÉ ===\n');
    console.log('Terminale L\' → Terminale L1');
    console.log('Terminale L → Terminale L2');
    console.log('Terminale S → Terminale S1');
    console.log('Terminale G → Terminale G');
    console.log('Terminale T → Terminale T');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
  
  process.exit(0);
}

checkSecondaire();
