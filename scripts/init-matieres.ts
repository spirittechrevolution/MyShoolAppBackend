/**
 * Script d'initialisation des matières
 * À exécuter UNE SEULE FOIS pour peupler la base de données
 * Usage: npm run init-matieres
 */

import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';

dotenv.config();

// Initialiser Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
db.settings({ databaseId: 'myschool-1', ignoreUndefinedProperties: true });

interface MatiereData {
  nom: string;
  niveauScolaire: 'ELEMENTAIRE' | 'MOYEN' | 'SECONDAIRE' | 'UNIVERSITAIRE';
  classe: string;
  description?: string;
  icone?: string;
  ordre: number;
  isActive: boolean;
}

/**
 * Matières par classe - À personnaliser selon vos besoins
 */
const MATIERES_PAR_CLASSE: Record<string, MatiereData[]> = {
  // ELEMENTAIRE
  'CM2': [
    { nom: 'Mathématiques', niveauScolaire: 'ELEMENTAIRE', classe: 'CM2', icone: '🔢', ordre: 1, isActive: true },
    { nom: 'Français', niveauScolaire: 'ELEMENTAIRE', classe: 'CM2', icone: '📖', ordre: 2, isActive: true },
    { nom: 'Anglais', niveauScolaire: 'ELEMENTAIRE', classe: 'CM2', icone: '🇬🇧', ordre: 3, isActive: true },
    { nom: 'Sciences', niveauScolaire: 'ELEMENTAIRE', classe: 'CM2', icone: '🔬', ordre: 4, isActive: true },
    { nom: 'Histoire-Géographie', niveauScolaire: 'ELEMENTAIRE', classe: 'CM2', icone: '🌍', ordre: 5, isActive: true }
  ],
  
  // MOYEN
  '3ème (BFEM)': [
    { nom: 'Mathématiques', niveauScolaire: 'MOYEN', classe: '3ème (BFEM)', icone: '🔢', ordre: 1, isActive: true },
    { nom: 'Physique-Chimie', niveauScolaire: 'MOYEN', classe: '3ème (BFEM)', icone: '⚗️', ordre: 2, isActive: true },
    { nom: 'SVT', niveauScolaire: 'MOYEN', classe: '3ème (BFEM)', icone: '🧬', ordre: 3, isActive: true },
    { nom: 'Français', niveauScolaire: 'MOYEN', classe: '3ème (BFEM)', icone: '📖', ordre: 4, isActive: true },
    { nom: 'Anglais', niveauScolaire: 'MOYEN', classe: '3ème (BFEM)', icone: '🇬🇧', ordre: 5, isActive: true },
    { nom: 'Histoire-Géographie', niveauScolaire: 'MOYEN', classe: '3ème (BFEM)', icone: '🌍', ordre: 6, isActive: true }
  ],
  
  // SECONDAIRE
  'Terminale S': [
    { nom: 'Mathématiques', niveauScolaire: 'SECONDAIRE', classe: 'Terminale S', icone: '🔢', ordre: 1, isActive: true },
    { nom: 'Physique-Chimie', niveauScolaire: 'SECONDAIRE', classe: 'Terminale S', icone: '⚗️', ordre: 2, isActive: true },
    { nom: 'SVT', niveauScolaire: 'SECONDAIRE', classe: 'Terminale S', icone: '🧬', ordre: 3, isActive: true },
    { nom: 'Français', niveauScolaire: 'SECONDAIRE', classe: 'Terminale S', icone: '📖', ordre: 4, isActive: true },
    { nom: 'Philosophie', niveauScolaire: 'SECONDAIRE', classe: 'Terminale S', icone: '🤔', ordre: 5, isActive: true },
    { nom: 'Anglais', niveauScolaire: 'SECONDAIRE', classe: 'Terminale S', icone: '🇬🇧', ordre: 6, isActive: true }
  ],
  
  // UNIVERSITAIRE
  'Licence 2': [
    { nom: 'Mathématiques', niveauScolaire: 'UNIVERSITAIRE', classe: 'Licence 2', icone: '🔢', ordre: 1, isActive: true },
    { nom: 'Physique', niveauScolaire: 'UNIVERSITAIRE', classe: 'Licence 2', icone: '⚛️', ordre: 2, isActive: true },
    { nom: 'Informatique', niveauScolaire: 'UNIVERSITAIRE', classe: 'Licence 2', icone: '💻', ordre: 3, isActive: true },
    { nom: 'Chimie', niveauScolaire: 'UNIVERSITAIRE', classe: 'Licence 2', icone: '⚗️', ordre: 4, isActive: true },
    { nom: 'Économie', niveauScolaire: 'UNIVERSITAIRE', classe: 'Licence 2', icone: '💰', ordre: 5, isActive: true }
  ]
};

async function initializeMatieres() {
  console.log('🚀 Initialisation des matières...\n');
  
  let totalCreated = 0;
  let totalSkipped = 0;
  
  for (const [classe, matieres] of Object.entries(MATIERES_PAR_CLASSE)) {
    console.log(`📚 Classe: ${classe}`);
    
    for (const matiere of matieres) {
      try {
        // Vérifier si la matière existe déjà
        const existing = await db.collection('matieres')
          .where('nom', '==', matiere.nom)
          .where('classe', '==', matiere.classe)
          .limit(1)
          .get();
        
        if (existing.empty) {
          // Créer la matière
          const docRef = await db.collection('matieres').add({
            ...matiere,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          
          console.log(`  ✅ ${matiere.icone} ${matiere.nom} créée (ID: ${docRef.id})`);
          totalCreated++;
        } else {
          console.log(`  ⏭️  ${matiere.icone} ${matiere.nom} existe déjà`);
          totalSkipped++;
        }
      } catch (error: any) {
        console.error(`  ❌ Erreur pour ${matiere.nom}:`, error.message);
      }
    }
    
    console.log(''); // Ligne vide entre les classes
  }
  
  console.log('📊 Résumé:');
  console.log(`  ✅ Créées: ${totalCreated}`);
  console.log(`  ⏭️  Ignorées (déjà existantes): ${totalSkipped}`);
  console.log(`  📦 Total: ${totalCreated + totalSkipped}\n`);
  
  console.log('✨ Initialisation terminée !');
  console.log('💡 Vous pouvez maintenant ajouter/modifier les matières via l\'API admin:');
  console.log('   POST /api/matieres');
  console.log('   PUT /api/matieres/:id');
  console.log('   DELETE /api/matieres/:id\n');
}

// Exécuter le script
initializeMatieres()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
