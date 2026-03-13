const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'myschool-f862b'
});

const db = admin.firestore();
db.settings({ databaseId: 'myschool-1' });

async function checkMoyenMatieres() {
  try {
    console.log('🔍 === DIAGNOSTIC: Matières MOYEN 4ème ===\n');
    
    // 1. Vérifier les matières pour 4ème
    console.log('📚 Matières pour 4ème (Firestore):');
    const quatriemeSnap = await db.collection('matieres')
      .where('niveauScolaire', '==', 'MOYEN')
      .where('classe', '==', '4ème')
      .get();
    
    console.log(`Total trouvé: ${quatriemeSnap.size}\n`);
    
    const existingMatieres = [];
    quatriemeSnap.forEach(doc => {
      const data = doc.data();
      const nom = data.nom;
      const hasSpace = nom !== nom.trim();
      existingMatieres.push(nom);
      console.log(`${hasSpace ? '⚠️' : '✅'} "${nom}" (trim: "${nom.trim()}", isActive: ${data.isActive})`);
    });
    
    // 2. Les matières que l'utilisateur veut utiliser
    console.log('\n\n❓ Matières demandées par l\'utilisateur:');
    const requestedMatieres = ['Français', 'Mathématiques', 'Pc collège'];
    
    requestedMatieres.forEach(m => {
      const exists = existingMatieres.includes(m);
      const trimmedExists = existingMatieres.some(em => em.trim() === m);
      console.log(`  ${exists ? '✅' : '❌'} "${m}" (exact: ${exists}, trimmed: ${trimmedExists})`);
    });
    
    // 3. Afficher TOUTES les matières MOYEN
    console.log('\n\n📋 TOUTES les matières MOYEN:');
    const allMoyenSnap = await db.collection('matieres')
      .where('niveauScolaire', '==', 'MOYEN')
      .get();
    
    const byClasse = {};
    allMoyenSnap.forEach(doc => {
      const data = doc.data();
      if (!byClasse[data.classe]) {
        byClasse[data.classe] = [];
      }
      byClasse[data.classe].push(data.nom);
    });
    
    const sortedClasses = Object.keys(byClasse).sort();
    sortedClasses.forEach(classe => {
      console.log(`\n${classe}:`);
      byClasse[classe].forEach(m => {
        const hasSpace = m !== m.trim();
        console.log(`  ${hasSpace ? '⚠️' : '✅'} "${m}"`);
      });
    });
    
    // 4. Chercher les problèmes d'espaces
    console.log('\n\n🔎 Vérification des espaces:');
    let problemCount = 0;
    allMoyenSnap.forEach(doc => {
      const data = doc.data();
      if (data.nom !== data.nom.trim()) {
        console.log(`⚠️ PROBLÈME: "${data.nom}" → "${data.nom.trim()}" (${data.classe})`);
        problemCount++;
      }
    });
    
    if (problemCount === 0) {
      console.log('✅ Aucun problème d\'espace détecté');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
  
  process.exit(0);
}

checkMoyenMatieres();
