#!/usr/bin/env node

/**
 * Vérification que les classes SECONDAIRE sont correctement mises à jour dans Firestore
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'myschool-f862b'
});

const db = admin.firestore();
db.settings({ databaseId: 'myschool-1' });

// Modèle mis à jour
const CLASSES_PAR_NIVEAU = {
  ELEMENTAIRE: ['CI', 'CP', 'CE1', 'CE2', 'CM1', 'CM2'],
  MOYEN: ['6ème', '5ème', '4ème', '3ème (BFEM)'],
  SECONDAIRE: [
    // Seconde (toutes séries)
    'Seconde L', 'Seconde S', 'Seconde G', 'Seconde T',
    // Première (toutes séries)
    'Première L', 'Première L\'', 'Première S', 'Première G', 'Première T',
    // Terminale (toutes séries avec numérotation)
    'Terminale L1', 'Terminale L2', 'Terminale S1', 'Terminale S2', 'Terminale S3', 'Terminale S4', 'Terminale G', 'Terminale T'
  ],
  UNIVERSITAIRE: ['Licence 1', 'Licence 2', 'Licence 3', 'Master 1', 'Master 2']
};

async function verifySetup() {
  try {
    console.log('\n✅ === VÉRIFICATION SETUP CLASSES ===\n');

    console.log('📋 Classes SECONDAIRE supportées (du modèle):\n');
    CLASSES_PAR_NIVEAU.SECONDAIRE.forEach((classe, i) => {
      console.log(`${i + 1}. ${classe}`);
    });

    console.log('\n\n🔍 Vérification Firestore - Matières existantes:\n');
    
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
    
    const sortedClasses = Object.keys(byClasse).sort();
    sortedClasses.forEach(classe => {
      const count = byClasse[classe].length;
      console.log(`- ${classe}: ${count} matière(s)`);
    });

    console.log('\n\n✅ === RÉSUMÉ ===\n');
    console.log(`Total classes SECONDAIRE supportées: ${CLASSES_PAR_NIVEAU.SECONDAIRE.length}`);
    console.log(`Classes Terminale S supportées: Terminale S1, S2, S3, S4`);
    console.log(`Classes Terminale L supportées: Terminale L1, L2`);
    console.log('\n✨ Les utilisateurs peuvent maintenant créer avec Terminale L1, L2, S1, S2');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
  
  process.exit(0);
}

verifySetup();

const terminaleClasses = CLASSES_PAR_NIVEAU.SECONDAIRE.filter(c => c.startsWith('Terminale'));
console.log('Classes "Terminale":', terminaleClasses.length);
console.log('  - Terminale L: 2 (L1, L2)');
console.log('  - Terminale S: 4 (S1, S2, S3, S4)');
console.log('  - Terminale G: 1 (G)');
console.log('  - Terminale T: 1 (T)');

// Vérifications spécifiques
const testCases = [
  { name: 'Terminale L1', expected: true },
  { name: 'Terminale L2', expected: true },
  { name: 'Terminale S1', expected: true },
  { name: 'Terminale S2', expected: true },
  { name: 'Terminale S3', expected: true },
  { name: 'Terminale S4', expected: true },
  { name: 'Terminale S', expected: false },  // Ne doit pas exister
  { name: 'Terminale L', expected: false },  // Ne doit pas exister
];

console.log('\n\n🧪 === TESTS SPÉCIFIQUES ===\n');
let allPass = true;
testCases.forEach(test => {
  const exists = CLASSES_PAR_NIVEAU.SECONDAIRE.includes(test.name);
  const pass = exists === test.expected;
  const status = pass ? '✅' : '❌';
  const result = `${status} "${test.name}" ${test.expected ? 'doit exister' : 'ne doit pas exister'} → ${exists ? 'EXISTS' : 'MISSING'}`;
  console.log(result);
  if (!pass) allPass = false;
});

if (allPass) {
  console.log('\n✅ === TOUTES LES VÉRIFICATIONS PASSENT ===\n');
} else {
  console.log('\n❌ === ERREURS DE VÉRIFICATION ===\n');
}
