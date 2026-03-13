const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'myschool-f862b'
});

const db = admin.firestore();
db.settings({ databaseId: 'myschool-1' });

async function testMatiereSearch() {
  try {
    console.log('🧪 === TEST: Recherche de matières ===\n');
    
    // 1. Ce que l'utilisateur envoie
    const inputMatieres = ['Français', 'Mathématiques', 'Pc collège'];
    const niveau = 'MOYEN';
    
    console.log('📝 Matières reçues du frontend:');
    inputMatieres.forEach((m, i) => {
      console.log(`  ${i+1}. "${m}" (length: ${m.length})`);
      console.log(`     Bytes: ${Buffer.from(m).toString('hex')}`);
    });
    
    // 2. Chercher chaque matière
    console.log('\n\n🔎 Recherche dans Firestore:\n');
    
    for (const matiereNom of inputMatieres) {
      console.log(`\nCherchant: "${matiereNom}"`);
      
      // Recherche EXACTE avec limit(1) - comme le code réel
      const snapshot = await db.collection('matieres')
        .where('nom', '==', matiereNom)
        .where('niveauScolaire', '==', niveau)
        .where('isActive', '==', true)
        .limit(1)
        .get();
      
      if (snapshot.empty) {
        console.log(`  ❌ Pas trouvé (exact)`);
      } else {
        console.log(`  ✅ Trouvé (actif) avec limit(1)`);
        const classeRetournee = snapshot.docs[0].data().classe;
        console.log(`     PREMIÈRE classe retournée: ${classeRetournee}`);
      }
      
      // Aussi afficher TOUTES les classes disponibles pour cette matière
      const allSnapshot = await db.collection('matieres')
        .where('nom', '==', matiereNom)
        .where('niveauScolaire', '==', niveau)
        .where('isActive', '==', true)
        .get();
      
      if (!allSnapshot.empty) {
        console.log(`   Classes disponibles pour "${matiereNom}":`);
        allSnapshot.docs.forEach((doc, idx) => {
          console.log(`     ${idx+1}. ${doc.data().classe}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
  
  process.exit(0);
}

testMatiereSearch();