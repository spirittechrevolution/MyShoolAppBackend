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

async function getClassesAsJSON() {
  try {
    // Récupérer les matières de Firestore
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
    
    // Construire la structure JSON
    const result = {
      timestamp: new Date().toISOString(),
      summary: {
        totalNiveaux: Object.keys(CLASSES_PAR_NIVEAU).length,
        totalClasses: Object.values(CLASSES_PAR_NIVEAU).reduce((sum, classes) => sum + classes.length, 0),
        classesAvecContenu: 0,
        classesSansContenu: 0
      },
      niveaux: {}
    };
    
    // Remplir les niveaux
    for (const [niveau, classes] of Object.entries(CLASSES_PAR_NIVEAU)) {
      result.niveaux[niveau] = {
        total: classes.length,
        classesAvecContenu: 0,
        classesSansContenu: 0,
        classes: []
      };
      
      classes.forEach((classe) => {
        const matiereCount = classesAvecMatieres[niveau]?.[classe] || 0;
        const hasContent = matiereCount > 0;
        
        if (hasContent) {
          result.niveaux[niveau].classesAvecContenu++;
          result.summary.classesAvecContenu++;
        } else {
          result.niveaux[niveau].classesSansContenu++;
          result.summary.classesAvecContenu = result.summary.classesAvecContenu; // Garder le compte des avec contenu
          result.summary.classesSansContenu++;
        }
        
        result.niveaux[niveau].classes.push({
          nom: classe,
          hasContent: hasContent,
          matieres: matiereCount,
          status: hasContent ? 'active' : 'pending'
        });
      });
      
      // Recalculer le résumé
      result.summary.classesAvecContenu += result.niveaux[niveau].classesAvecContenu;
    }
    
    // Reconstruire le résumé correctement
    result.summary.classesAvecContenu = 0;
    result.summary.classesSansContenu = 0;
    for (const [niveau, data] of Object.entries(result.niveaux)) {
      result.summary.classesAvecContenu += data.classesAvecContenu;
      result.summary.classesSansContenu += data.classesSansContenu;
    }
    
    // Afficher en JSON
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('Erreur:', error.message);
    process.exit(1);
  }
  
  process.exit(0);
}

getClassesAsJSON();
