const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'myschool-f862b'
});

const db = admin.firestore();
db.settings({ databaseId: 'myschool-1' });

async function diagnoseMatieres() {
  try {
    console.log('🔍 === DIAGNOSTIC MATIÈRES SECONDAIRE ===\n');
    
    // 1. Vérifier les matières pour Seconde S
    console.log('📚 Matières existantes pour Seconde S:');
    const secondeSSnap = await db.collection('matieres')
      .where('niveauScolaire', '==', 'SECONDAIRE')
      .where('classe', '==', 'Seconde S')
      .get();
    
    console.log(`Trouvé: ${secondeSSnap.size} matière(s)\n`);
    
    const existingMatieres = [];
    secondeSSnap.forEach(doc => {
      const data = doc.data();
      console.log(`  - "${data.nom}" (isActive: ${data.isActive})`);
      existingMatieres.push(data.nom);
    });
    
    // 2. Vérifier les matières demandées
    console.log('\n\n❓ Matières demandées par l\'utilisateur:');
    const requestedMatieres = ['Histoire & Géographie', 'Mathématiques', 'Français'];
    requestedMatieres.forEach(m => {
      const exists = existingMatieres.includes(m);
      console.log(`  ${exists ? '✅' : '❌'} "${m}"`);
    });
    
    // 3. Afficher TOUTES les matières SECONDAIRE
    console.log('\n\n📋 TOUTES les matières SECONDAIRE disponibles:');
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
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
  
  process.exit(0);
}

diagnoseMatieres();
    
    const requiredMatieres = {
      MOYEN: ['Mathématiques', 'Physique-Chimie', 'SVT', 'Français', 'Anglais', 'Histoire-Géographie'],
      SECONDAIRE: ['Mathématiques', 'Physique-Chimie', 'SVT', 'Français', 'Philosophie', 'Anglais'],
      UNIVERSITAIRE: ['Mathématiques', 'Physique', 'Informatique', 'Chimie', 'Économie']
    };

    for (const [niveau, matieres] of Object.entries(requiredMatieres)) {
      console.log(`${niveau}:`);
      for (const matiereNom of matieres) {
        const exists = allMatieres.docs.some(doc => 
          doc.data().nom === matiereNom && 
          doc.data().niveauScolaire === niveau &&
          doc.data().isActive
        );
        const status = exists ? '✅' : '❌';
        console.log(`  ${status} ${matiereNom}`);
      }
      console.log('');
    }

    // Tester la recherche par nom
    console.log('🧪 Test de recherche (Moyen):\n');
    const testResults = await Promise.all([
      db.collection('matieres')
        .where('nom', '==', 'Mathématiques')
        .where('niveauScolaire', '==', 'MOYEN')
        .where('isActive', '==', true)
        .get(),
      db.collection('matieres')
        .where('nom', '==', 'Mathématiques')
        .where('niveauScolaire', '==', 'MOYEN')
        .get()
    ]);

    console.log('Recherche "Mathématiques" pour MOYEN (active):');
    console.log(`  Résultats: ${testResults[0].size}`);
    if (testResults[0].size > 0) {
      console.log(`  ✅ Classe: ${testResults[0].docs[0].data().classe}`);
    }
    
    console.log('\nRecherche "Mathématiques" pour MOYEN (tout état):');
    console.log(`  Résultats: ${testResults[1].size}`);
    if (testResults[1].size > 0) {
      const data = testResults[1].docs[0].data();
      console.log(`  Classe: ${data.classe}`);
      console.log(`  isActive: ${data.isActive}`);
    }

    // Recommandations
    console.log('\n📝 Recommandations:\n');
    const hasInactive = allMatieres.docs.some(doc => !doc.data().isActive);
    if (hasInactive) {
      console.log('⚠️  ATTENTION: Certaines matières sont inactives!');
      console.log('   → Exécutez: npm run init-matieres\n');
    }

    const activeCount = allMatieres.docs.filter(doc => doc.data().isActive).length;
    if (activeCount < 14) {
      console.log('⚠️  ATTENTION: Peu de matières actives!');
      console.log('   → Exécutez: npm run init-matieres\n');
    }

    console.log('✅ Diagnostic terminé!');
  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

diagnoseMatieres();
