/**
 * Script pour réparer les matières en production
 * Réinitialise et réactive les matières qui sont inactives ou manquantes
 * Usage: node fix-matieres.js
 */

const admin = require('firebase-admin');
const path = require('path');

if (!admin.apps.length) {
  const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
  try {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } catch (error) {
    console.error('❌ Erreur: serviceAccountKey.json non trouvé');
    process.exit(1);
  }
}

const db = admin.firestore();
db.settings({ databaseId: 'myschool-1', ignoreUndefinedProperties: true });

const MATIERES_PAR_CLASSE = {
  // ELEMENTAIRE
  'CM2': [
    { nom: 'Mathématiques', niveauScolaire: 'ELEMENTAIRE', classe: 'CM2', icone: '🔢', ordre: 1 },
    { nom: 'Français', niveauScolaire: 'ELEMENTAIRE', classe: 'CM2', icone: '📖', ordre: 2 },
    { nom: 'Anglais', niveauScolaire: 'ELEMENTAIRE', classe: 'CM2', icone: '🇬🇧', ordre: 3 },
    { nom: 'Sciences', niveauScolaire: 'ELEMENTAIRE', classe: 'CM2', icone: '🔬', ordre: 4 },
    { nom: 'Histoire-Géographie', niveauScolaire: 'ELEMENTAIRE', classe: 'CM2', icone: '🌍', ordre: 5 }
  ],
  
  // MOYEN
  '3ème (BFEM)': [
    { nom: 'Mathématiques', niveauScolaire: 'MOYEN', classe: '3ème (BFEM)', icone: '🔢', ordre: 1 },
    { nom: 'Physique-Chimie', niveauScolaire: 'MOYEN', classe: '3ème (BFEM)', icone: '⚗️', ordre: 2 },
    { nom: 'SVT', niveauScolaire: 'MOYEN', classe: '3ème (BFEM)', icone: '🧬', ordre: 3 },
    { nom: 'Français', niveauScolaire: 'MOYEN', classe: '3ème (BFEM)', icone: '📖', ordre: 4 },
    { nom: 'Anglais', niveauScolaire: 'MOYEN', classe: '3ème (BFEM)', icone: '🇬🇧', ordre: 5 },
    { nom: 'Histoire-Géographie', niveauScolaire: 'MOYEN', classe: '3ème (BFEM)', icone: '🌍', ordre: 6 }
  ],
  
  // SECONDAIRE
  'Terminale S': [
    { nom: 'Mathématiques', niveauScolaire: 'SECONDAIRE', classe: 'Terminale S', icone: '🔢', ordre: 1 },
    { nom: 'Physique-Chimie', niveauScolaire: 'SECONDAIRE', classe: 'Terminale S', icone: '⚗️', ordre: 2 },
    { nom: 'SVT', niveauScolaire: 'SECONDAIRE', classe: 'Terminale S', icone: '🧬', ordre: 3 },
    { nom: 'Français', niveauScolaire: 'SECONDAIRE', classe: 'Terminale S', icone: '📖', ordre: 4 },
    { nom: 'Philosophie', niveauScolaire: 'SECONDAIRE', classe: 'Terminale S', icone: '🤔', ordre: 5 },
    { nom: 'Anglais', niveauScolaire: 'SECONDAIRE', classe: 'Terminale S', icone: '🇬🇧', ordre: 6 }
  ],
  
  // UNIVERSITAIRE
  'Licence 2': [
    { nom: 'Mathématiques', niveauScolaire: 'UNIVERSITAIRE', classe: 'Licence 2', icone: '🔢', ordre: 1 },
    { nom: 'Physique', niveauScolaire: 'UNIVERSITAIRE', classe: 'Licence 2', icone: '⚛️', ordre: 2 },
    { nom: 'Informatique', niveauScolaire: 'UNIVERSITAIRE', classe: 'Licence 2', icone: '💻', ordre: 3 },
    { nom: 'Chimie', niveauScolaire: 'UNIVERSITAIRE', classe: 'Licence 2', icone: '⚗️', ordre: 4 },
    { nom: 'Économie', niveauScolaire: 'UNIVERSITAIRE', classe: 'Licence 2', icone: '💰', ordre: 5 }
  ]
};

async function fixMatieres() {
  console.log('🔧 Réparation des matières...\n');
  
  try {
    let totalCreated = 0;
    let totalUpdated = 0;
    let totalReactivated = 0;

    for (const [classe, matieres] of Object.entries(MATIERES_PAR_CLASSE)) {
      console.log(`📚 Traitement de la classe: ${classe}`);

      for (const matiere of matieres) {
        try {
          // Chercher la matière
          const snapshot = await db.collection('matieres')
            .where('nom', '==', matiere.nom)
            .where('classe', '==', matiere.classe)
            .limit(1)
            .get();

          if (!snapshot.empty) {
            // Matière existe
            const doc = snapshot.docs[0];
            const existingData = doc.data();

            if (existingData.isActive) {
              // Déjà active: ne rien faire
              console.log(`  ✅ ${matiere.nom} (déjà active)`);
            } else {
              // Inactive: réactiver
              await db.collection('matieres').doc(doc.id).update({
                isActive: true,
                updatedAt: new Date()
              });
              console.log(`  🔄 ${matiere.nom} (réactivée)`);
              totalReactivated++;
            }
          } else {
            // Matière n'existe pas: créer
            const matiereData = {
              ...matiere,
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date()
            };

            await db.collection('matieres').add(matiereData);
            console.log(`  ✨ ${matiere.nom} (créée)`);
            totalCreated++;
          }
        } catch (error) {
          console.error(`  ❌ Erreur pour "${matiere.nom}":`, error.message);
        }
      }
      console.log('');
    }

    console.log('✅ Résumé de la réparation:');
    console.log(`  ✨ Créées: ${totalCreated}`);
    console.log(`  🔄 Réactivées: ${totalReactivated}`);
    console.log(`  ✅ Sans changement: ${Object.values(MATIERES_PAR_CLASSE).flat().length - totalCreated - totalReactivated}`);
    console.log(`\n✅ Matières réparées avec succès!\n`);

    // Vérifier le résultat
    console.log('🔍 Vérification...\n');
    const allMatieres = await db.collection('matieres')
      .where('isActive', '==', true)
      .get();

    console.log(`📊 Total de matières actives: ${allMatieres.size}`);

    const byLevel = {};
    allMatieres.forEach(doc => {
      const niveau = doc.data().niveauScolaire;
      byLevel[niveau] = (byLevel[niveau] || 0) + 1;
    });

    for (const [niveau, count] of Object.entries(byLevel)) {
      console.log(`   ${niveau}: ${count}`);
    }

    console.log('\n✅ Réparation terminée!');
  } catch (error) {
    console.error('❌ Erreur lors de la réparation:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

fixMatieres();
