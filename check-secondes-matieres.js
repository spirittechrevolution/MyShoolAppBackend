const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'myschool-f862b'
});

const db = admin.firestore();
db.settings({ databaseId: 'myschool-1' });

async function checkSecondeSMatieres() {
  try {
    console.log('🔍 === DIAGNOSTIC: Matières Seconde S ===\n');
    
    // 1. Vérifier les matières pour Seconde S
    console.log('📚 Matières pour Seconde S (Firestore):');
    const secondeSSnap = await db.collection('matieres')
      .where('niveauScolaire', '==', 'SECONDAIRE')
      .where('classe', '==', 'Seconde S')
      .get();
    
    console.log(`Total trouvé: ${secondeSSnap.size}\n`);
    
    const existingMatieres = [];
    const results = [];
    secondeSSnap.forEach(doc => {
      const data = doc.data();
      existingMatieres.push(data.nom);
      results.push({
        nom: data.nom,
        isActive: data.isActive,
        id: doc.id
      });
    });
    
    results.forEach(m => {
      const status = m.isActive ? '✅' : '❌ INACTIVE';
      console.log(`${status} "${m.nom}"`);
    });
    
    // 2. Les matières que l'utilisateur veut utiliser
    console.log('\n\n❓ Matières demandées par l\'utilisateur:');
    const requestedMatieres = ['Histoire & Géographie', 'Mathématiques', 'Français'];
    
    const matching = [];
    const missing = [];
    
    requestedMatieres.forEach(m => {
      if (existingMatieres.includes(m)) {
        matching.push(m);
        console.log(`  ✅ "${m}" EXISTE`);
      } else {
        missing.push(m);
        console.log(`  ❌ "${m}" MANQUE ou NOM DIFFÉRENT`);
      }
    });
    
    // 3. Suggestion de matières à utiliser
    if (missing.length > 0) {
      console.log('\n\n💡 Matières disponibles à la place:');
      existingMatieres.forEach(m => {
        console.log(`  → "${m}"`);
      });
    }
    
    // 4. Afficher TOUTES les matières SECONDAIRE
    console.log('\n\n📋 TOUTES les matières SECONDAIRE:');
    const allSecondaireSnap = await db.collection('matieres')
      .where('niveauScolaire', '==', 'SECONDAIRE')
      .get();
    
    const byClasse = {};
    allSecondaireSnap.forEach(doc => {
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
    
    // 5. Résumé
    console.log('\n\n=== RÉSUMÉ ===');
    console.log(`✅ Matières valides trouvées: ${matching.length}/${requestedMatieres.length}`);
    console.log(`❌ Matières manquantes: ${missing.length}/${requestedMatieres.length}`);
    
    if (missing.length > 0) {
      console.log('\n⚠️  SOLUTION: Utilisez une de ces combinaisons:');
      if (existingMatieres.length >= 3) {
        console.log(`  Option 1: ${existingMatieres.slice(0, 3).join(', ')}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
  
  process.exit(0);
}

checkSecondeSMatieres();
