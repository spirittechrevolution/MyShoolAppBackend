/**
 * Script de migration vers le nouveau modèle basé sur classe
 * 
 * Ce script migre les données existantes vers le nouveau système :
 * - Ajoute la classe aux utilisateurs existants
 * - Ajoute niveauScolaire et classe aux cours existants
 * - Met à jour les abonnements avec le champ classe
 * - Ajoute classe aux matières existantes
 * 
 * ATTENTION : Exécuter en environnement de développement d'abord !
 * 
 * Usage: npm run migrate
 */

import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

// Initialiser Firebase Admin avec service account
if (!admin.apps.length) {
  const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');
  
  try {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ Firebase Admin initialisé avec serviceAccountKey.json\n');
  } catch (error) {
    console.error('❌ Erreur : serviceAccountKey.json non trouvé');
    console.log('💡 Assurez-vous que serviceAccountKey.json est à la racine du projet\n');
    process.exit(1);
  }
}

const db = admin.firestore();
db.settings({ databaseId: 'myschool-1', ignoreUndefinedProperties: true });

// Récupérer les arguments de ligne de commande
const args = process.argv.slice(2);
const isDryRun = !args.includes('--real') && process.env.MIGRATION_MODE !== 'real'; // Par défaut dry-run

/**
 * Mapping des anciennes catégories vers les classes
 */
const CATEGORY_TO_CLASSE: Record<string, { niveau: string; classes: string[] }> = {
  'PC au collège': { niveau: 'MOYEN', classes: ['6ème', '5ème', '4ème', '3ème (BFEM)'] },
  'Maths au lycée': { niveau: 'SECONDAIRE', classes: ['Seconde S', 'Première S', 'Terminale S'] },
  'Sciences': { niveau: 'UNIVERSITAIRE', classes: ['Licence 1', 'Licence 2', 'Licence 3'] }
  // Ajoutez d'autres mappings selon vos catégories
};

/**
 * Migrer les utilisateurs
 */
async function migrateUsers(dryRun: boolean = true) {
  console.log('\n📋 Migration des utilisateurs...');
  
  const snapshot = await db.collection('utilisateur').get();
  let updated = 0;
  let skipped = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    
    // Si l'utilisateur a déjà une classe, on skip
    if (data.classe) {
      skipped++;
      continue;
    }

    // Déterminer la classe par défaut selon le niveau
    let classe: string | undefined;
    let niveauScolaire = data.niveauScolaire || 'MOYEN';

    switch (niveauScolaire) {
      case 'ELEMENTAIRE':
        classe = 'CM2'; // Classe par défaut
        break;
      case 'MOYEN':
        classe = '3ème (BFEM)';
        break;
      case 'SECONDAIRE':
        classe = 'Terminale S';
        break;
      case 'UNIVERSITAIRE':
        classe = 'Licence 2';
        break;
      default:
        classe = '3ème (BFEM)';
    }

    console.log(`  ${dryRun ? '[DRY RUN] ' : ''}User ${doc.id} (${data.firstName} ${data.lastName})`);
    console.log(`    Niveau: ${niveauScolaire} → Classe: ${classe}`);

    if (!dryRun) {
      await doc.ref.update({
        classe: classe,
        niveauScolaire: niveauScolaire,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      updated++;
    }
  }

  console.log(`\n  ✅ Utilisateurs ${dryRun ? 'à mettre à jour' : 'mis à jour'}: ${updated}`);
  console.log(`  ⏭️  Utilisateurs ignorés (déjà avec classe): ${skipped}`);
  console.log(`  📊 Total: ${snapshot.size}`);
}

/**
 * Migrer les cours
 */
async function migrateCourses(dryRun: boolean = true) {
  console.log('\n📚 Migration des cours...');
  
  const snapshot = await db.collection('courses').get();
  let updated = 0;
  let skipped = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    
    // Si le cours a déjà une classe, on skip
    if (data.classe) {
      skipped++;
      continue;
    }

    // Déterminer niveau et classe depuis la catégorie
    const category = data.category || 'Sciences';
    const mapping = CATEGORY_TO_CLASSE[category] || CATEGORY_TO_CLASSE['Sciences'];
    
    // Choisir la première classe par défaut
    const niveauScolaire = mapping.niveau;
    const classe = mapping.classes[0];

    console.log(`  ${dryRun ? '[DRY RUN] ' : ''}Course ${doc.id} (${data.title})`);
    console.log(`    Catégorie: ${category} → Niveau: ${niveauScolaire}, Classe: ${classe}`);

    if (!dryRun) {
      await doc.ref.update({
        niveauScolaire: niveauScolaire,
        classe: classe,
        // Garder category pour compatibilité temporaire
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      updated++;
    }
  }

  console.log(`\n  ✅ Cours ${dryRun ? 'à mettre à jour' : 'mis à jour'}: ${updated}`);
  console.log(`  ⏭️  Cours ignorés: ${skipped}`);
  console.log(`  📊 Total: ${snapshot.size}`);
}

/**
 * Migrer les abonnements
 */
async function migrateSubscriptions(dryRun: boolean = true) {
  console.log('\n💳 Migration des abonnements...');
  
  const snapshot = await db.collection('subscriptions').get();
  let updated = 0;
  let skipped = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    
    // Si l'abonnement a déjà une classe, on skip
    if (data.classe) {
      skipped++;
      continue;
    }

    // Récupérer l'utilisateur pour obtenir sa classe
    const userId = data.userId;
    const userDoc = await db.collection('utilisateur').doc(userId).get();
    const userData = userDoc.data();

    if (!userData || !userData.classe) {
      console.log(`  ⚠️  User ${userId} n'a pas de classe - skip subscription ${doc.id}`);
      skipped++;
      continue;
    }

    const classe = userData.classe;
    const typeAbonnement = userData.niveauScolaire === 'ELEMENTAIRE' ? 'CLASSE' : 'MATIERE';

    console.log(`  ${dryRun ? '[DRY RUN] ' : ''}Subscription ${doc.id}`);
    console.log(`    User: ${userId} → Classe: ${classe}, Type: ${typeAbonnement}`);

    if (!dryRun) {
      await doc.ref.update({
        classe: classe,
        typeAbonnement: typeAbonnement,
        niveauScolaire: userData.niveauScolaire,
        // Si MATIERE, initialiser avec tableau vide (l'admin devra les ajouter)
        matieres: typeAbonnement === 'MATIERE' ? [] : undefined,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      updated++;
    }
  }

  console.log(`\n  ✅ Abonnements ${dryRun ? 'à mettre à jour' : 'mis à jour'}: ${updated}`);
  console.log(`  ⏭️  Abonnements ignorés: ${skipped}`);
  console.log(`  📊 Total: ${snapshot.size}`);
  
  if (!dryRun && updated > 0) {
    console.log('\n  ⚠️  IMPORTANT: Les abonnements MATIERE ont été créés avec matieres=[]');
    console.log('    Les utilisateurs devront sélectionner 3 matières manuellement.');
  }
}

/**
 * Migrer les matières (si elles existent déjà)
 */
async function migrateMatieres(dryRun: boolean = true) {
  console.log('\n📖 Migration des matières...');
  
  const snapshot = await db.collection('matieres').get();
  
  if (snapshot.empty) {
    console.log('  ℹ️  Aucune matière trouvée - utilisez le script init-matieres.ts');
    return;
  }

  let updated = 0;
  let skipped = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    
    if (data.classe) {
      skipped++;
      continue;
    }

    // Assigner une classe par défaut selon le niveau
    const niveauScolaire = data.niveauScolaire || 'MOYEN';
    let classe: string;

    switch (niveauScolaire) {
      case 'ELEMENTAIRE':
        classe = 'CM2';
        break;
      case 'MOYEN':
        classe = '3ème (BFEM)';
        break;
      case 'SECONDAIRE':
        classe = 'Terminale S';
        break;
      case 'UNIVERSITAIRE':
        classe = 'Licence 2';
        break;
      default:
        classe = '3ème (BFEM)';
    }

    console.log(`  ${dryRun ? '[DRY RUN] ' : ''}Matière ${doc.id} (${data.nom})`);
    console.log(`    Niveau: ${niveauScolaire} → Classe: ${classe}`);

    if (!dryRun) {
      await doc.ref.update({
        classe: classe,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      updated++;
    }
  }

  console.log(`\n  ✅ Matières ${dryRun ? 'à mettre à jour' : 'mises à jour'}: ${updated}`);
  console.log(`  ⏭️  Matières ignorées: ${skipped}`);
  console.log(`  📊 Total: ${snapshot.size}`);
}

/**
 * Exécuter la migration complète
 */
async function runMigration() {
  console.log('🚀 Migration vers le modèle basé sur classe\n');
  
  if (isDryRun) {
    console.log('📋 Mode DRY RUN activé - aucune modification ne sera faite');
    console.log('💡 Pour exécuter la migration réelle, utilisez : npm run migrate -- --real\n');
  } else {
    console.log('🔥 Mode RÉEL - Les données seront modifiées !');
    console.log('⚠️  ATTENTION : Assurez-vous d\'avoir fait un backup avant de continuer\n');
  }

  await migrateUsers(isDryRun);
  await migrateCourses(isDryRun);
  await migrateSubscriptions(isDryRun);
  await migrateMatieres(isDryRun);

  console.log('\n✅ Migration terminée avec succès !\n');
  
  if (isDryRun) {
    console.log('📝 Prochaine étape :');
    console.log('  Exécuter en mode réel : npm run migrate -- --real\n');
  } else {
    console.log('📝 Prochaines étapes :');
    console.log('  1. Vérifier les données migrées dans Firestore Console');
    console.log('  2. Exécuter : npm run init-matieres');
    console.log('  3. Demander aux utilisateurs avec abonnement MATIERE de sélectionner 3 matières');
    console.log('  4. Tester les endpoints mis à jour\n');
  }

  process.exit(0);
}

// Exécuter la migration
runMigration().catch((error) => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
