// Script pour initialiser les matières de base dans Firestore
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
db.settings({ databaseId: 'myschool-1' });

const matieres = [
  // ELEMENTAIRE (CM1, CM2)
  { nom: 'Mathématiques', niveauScolaire: 'ELEMENTAIRE', classe: 'CM1', icon: '🔢', color: '#4CAF50', ordre: 1, isActive: true },
  { nom: 'Français', niveauScolaire: 'ELEMENTAIRE', classe: 'CM1', icon: '📝', color: '#2196F3', ordre: 2, isActive: true },
  { nom: 'Sciences', niveauScolaire: 'ELEMENTAIRE', classe: 'CM1', icon: '🔬', color: '#9C27B0', ordre: 3, isActive: true },
  { nom: 'Histoire-Géographie', niveauScolaire: 'ELEMENTAIRE', classe: 'CM1', icon: '🌍', color: '#FF9800', ordre: 4, isActive: true },
  
  { nom: 'Mathématiques', niveauScolaire: 'ELEMENTAIRE', classe: 'CM2', icon: '🔢', color: '#4CAF50', ordre: 1, isActive: true },
  { nom: 'Français', niveauScolaire: 'ELEMENTAIRE', classe: 'CM2', icon: '📝', color: '#2196F3', ordre: 2, isActive: true },
  { nom: 'Sciences', niveauScolaire: 'ELEMENTAIRE', classe: 'CM2', icon: '🔬', color: '#9C27B0', ordre: 3, isActive: true },
  { nom: 'Histoire-Géographie', niveauScolaire: 'ELEMENTAIRE', classe: 'CM2', icon: '🌍', color: '#FF9800', ordre: 4, isActive: true },

  // MOYEN (6ème, 5ème, 4ème, 3ème BFEM)
  { nom: 'Mathématiques', niveauScolaire: 'MOYEN', classe: '6ème', icon: '🔢', color: '#4CAF50', ordre: 1, isActive: true },
  { nom: 'Français', niveauScolaire: 'MOYEN', classe: '6ème', icon: '📝', color: '#2196F3', ordre: 2, isActive: true },
  { nom: 'Anglais', niveauScolaire: 'MOYEN', classe: '6ème', icon: '🇬🇧', color: '#F44336', ordre: 3, isActive: true },
  { nom: 'SVT', niveauScolaire: 'MOYEN', classe: '6ème', icon: '🧬', color: '#8BC34A', ordre: 4, isActive: true },
  { nom: 'Histoire-Géographie', niveauScolaire: 'MOYEN', classe: '6ème', icon: '🌍', color: '#FF9800', ordre: 5, isActive: true },
  { nom: 'Physique-Chimie', niveauScolaire: 'MOYEN', classe: '6ème', icon: '⚗️', color: '#00BCD4', ordre: 6, isActive: true },

  { nom: 'Mathématiques', niveauScolaire: 'MOYEN', classe: '3ème (BFEM)', icon: '🔢', color: '#4CAF50', ordre: 1, isActive: true },
  { nom: 'Français', niveauScolaire: 'MOYEN', classe: '3ème (BFEM)', icon: '📝', color: '#2196F3', ordre: 2, isActive: true },
  { nom: 'Anglais', niveauScolaire: 'MOYEN', classe: '3ème (BFEM)', icon: '🇬🇧', color: '#F44336', ordre: 3, isActive: true },
  { nom: 'SVT', niveauScolaire: 'MOYEN', classe: '3ème (BFEM)', icon: '🧬', color: '#8BC34A', ordre: 4, isActive: true },
  { nom: 'Histoire-Géographie', niveauScolaire: 'MOYEN', classe: '3ème (BFEM)', icon: '🌍', color: '#FF9800', ordre: 5, isActive: true },
  { nom: 'Physique-Chimie', niveauScolaire: 'MOYEN', classe: '3ème (BFEM)', icon: '⚗️', color: '#00BCD4', ordre: 6, isActive: true },

  // SECONDAIRE (Seconde, Première, Terminale)
  { nom: 'Mathématiques', niveauScolaire: 'SECONDAIRE', classe: 'Terminale S', icon: '🔢', color: '#4CAF50', ordre: 1, isActive: true },
  { nom: 'Physique', niveauScolaire: 'SECONDAIRE', classe: 'Terminale S', icon: '⚛️', color: '#00BCD4', ordre: 2, isActive: true },
  { nom: 'Chimie', niveauScolaire: 'SECONDAIRE', classe: 'Terminale S', icon: '🧪', color: '#9C27B0', ordre: 3, isActive: true },
  { nom: 'SVT', niveauScolaire: 'SECONDAIRE', classe: 'Terminale S', icon: '🧬', color: '#8BC34A', ordre: 4, isActive: true },
  { nom: 'Philosophie', niveauScolaire: 'SECONDAIRE', classe: 'Terminale S', icon: '🤔', color: '#795548', ordre: 5, isActive: true },
  { nom: 'Français', niveauScolaire: 'SECONDAIRE', classe: 'Terminale S', icon: '📝', color: '#2196F3', ordre: 6, isActive: true },

  // UNIVERSITAIRE  
  { nom: 'Algorithmique', niveauScolaire: 'UNIVERSITAIRE', classe: 'Licence 1 Informatique', icon: '💻', color: '#2196F3', ordre: 1, isActive: true },
  { nom: 'Base de données', niveauScolaire: 'UNIVERSITAIRE', classe: 'Licence 1 Informatique', icon: '🗄️', color: '#4CAF50', ordre: 2, isActive: true },
  { nom: 'Réseaux', niveauScolaire: 'UNIVERSITAIRE', classe: 'Licence 1 Informatique', icon: '🌐', color: '#FF9800', ordre: 3, isActive: true },
  { nom: 'Programmation', niveauScolaire: 'UNIVERSITAIRE', classe: 'Licence 1 Informatique', icon: '⌨️', color: '#9C27B0', ordre: 4, isActive: true },
];

async function initMatieres() {
  console.log('🚀 Initialisation des matières dans Firestore...\n');

  try {
    const batch = db.batch();
    let count = 0;

    for (const matiere of matieres) {
      const matiereRef = db.collection('matiere').doc();
      batch.set(matiereRef, {
        ...matiere,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      count++;
      console.log(`✅ ${count}. ${matiere.nom} - ${matiere.niveauScolaire} - ${matiere.classe}`);
    }

    await batch.commit();
    
    console.log(`\n✅ ${count} matières créées avec succès!`);
    
    // Vérification
    console.log('\n📊 Vérification des matières créées par niveau:');
    const niveaux = ['ELEMENTAIRE', 'MOYEN', 'SECONDAIRE', 'UNIVERSITAIRE'];
    
    for (const niveau of niveaux) {
      const snapshot = await db.collection('matiere')
        .where('niveauScolaire', '==', niveau)
        .where('isActive', '==', true)
        .get();
      console.log(`  - ${niveau}: ${snapshot.size} matières`);
    }

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
  } finally {
    process.exit(0);
  }
}

initMatieres();
