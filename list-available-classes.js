const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'myschool-f862b'
});

const db = admin.firestore();
db.settings({ databaseId: 'myschool-1' });

// Modèle officiel des classes
const CLASSES_PAR_NIVEAU = {
  ELEMENTAIRE: ['CI', 'CP', 'CE1', 'CE2', 'CM1', 'CM2'],
  MOYEN: ['6ème', '5ème', '4ème', '3ème (BFEM)'],
  SECONDAIRE: [
    'Seconde L', 'Seconde S', 'Seconde G', 'Seconde T',
    'Première L', 'Première L\'', 'Première S', 'Première G', 'Première T',
    'Terminale L1', 'Terminale L2', 'Terminale S1', 'Terminale S2', 'Terminale S3', 'Terminale S4', 'Terminale G', 'Terminale T'
  ],
  UNIVERSITAIRE: ['Licence 1', 'Licence 2', 'Licence 3', 'Master 1', 'Master 2']
};

async function getAvailableClasses() {
  try {
    console.log('\n📚 === CLASSES DISPONIBLES PAR NIVEAU ===\n');
    
    // Récupérer les matières de Firestore pour voir quelles classes ont du contenu
    const matieresSnap = await db.collection('matieres').get();
    
    const classesAvecMatieres = {};
    matieresSnap.forEach(doc => {
      const data = doc.data();
      const niveau = data.niveauScolaire;
      const classe = data.classe;
      
      if (!classesAvecMatieres[niveau]) {
        classesAvecMatieres[niveau] = {};
      }
      if (!classesAvecMatieres[niveau][classe]) {
        classesAvecMatieres[niveau][classe] = 0;
      }
      classesAvecMatieres[niveau][classe]++;
    });
    
    // Afficher pour chaque niveau
    for (const [niveau, classes] of Object.entries(CLASSES_PAR_NIVEAU)) {
      console.log(`\n${'═'.repeat(60)}`);
      console.log(`🎓 ${niveau}`);
      console.log(`${'═'.repeat(60)}\n`);
      
      classes.forEach((classe, index) => {
        const count = classesAvecMatieres[niveau]?.[classe] || 0;
        const status = count > 0 ? '✅' : '⏳';
        console.log(`${index + 1}. ${status} ${classe}${count > 0 ? ` (${count} matière${count > 1 ? 's' : ''})` : ''}`);
      });
      
      console.log(`\n📊 Total: ${classes.length} classe(s)`);
      
      // Compter les classes avec matières
      const classesWithSubjects = classes.filter(
        c => classesAvecMatieres[niveau]?.[c] > 0
      ).length;
      console.log(`📖 Classes avec matières: ${classesWithSubjects}/${classes.length}`);
    }
    
    console.log(`\n${'═'.repeat(60)}`);
    console.log('\n📋 === RÉSUMÉ GLOBAL ===\n');
    
    let totalClasses = 0;
    let totalAvec = 0;
    
    for (const [niveau, classes] of Object.entries(CLASSES_PAR_NIVEAU)) {
      totalClasses += classes.length;
      const classesAvec = classes.filter(
        c => classesAvecMatieres[niveau]?.[c] > 0
      ).length;
      totalAvec += classesAvec;
      
      console.log(`${niveau.padEnd(20)} : ${classesAvec.toString().padStart(2)}/${classes.length} classes`);
    }
    
    console.log(`${'─'.repeat(40)}`);
    console.log(`TOTAL : ${totalAvec}/${totalClasses} classes`);
    
    console.log(`\n✅ Configuration prête pour abonnements!\n`);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
  
  process.exit(0);
}

getAvailableClasses();
