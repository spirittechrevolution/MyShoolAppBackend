import { db } from '../config/firebase.config';

/**
 * Script de nettoyage des données de test dans Firestore
 * Supprime les documents créés pendant les tests
 */

async function cleanupTestData() {
  console.log('🧹 Début du nettoyage des données de test...\n');

  try {
    // 1. Supprimer les utilisateurs de test
    console.log('📝 Suppression des utilisateurs de test...');
    const usersSnapshot = await db.collection('utilisateur').get();
    let usersDeleted = 0;
    
    for (const doc of usersSnapshot.docs) {
      const data = doc.data();
      // Supprimer si firstName contient "Test" ou "Updated"
      if (data.firstName && (data.firstName.includes('Test') || data.firstName.includes('Updated'))) {
        await db.collection('utilisateur').doc(doc.id).delete();
        console.log(`  ✓ Utilisateur supprimé: ${doc.id} (${data.firstName} ${data.lastName || ''})`);
        usersDeleted++;
      }
    }
    console.log(`✅ ${usersDeleted} utilisateurs de test supprimés\n`);

    // 2. Supprimer les cours de test
    console.log('📚 Suppression des cours de test...');
    const coursesSnapshot = await db.collection('courses').get();
    let coursesDeleted = 0;
    
    for (const doc of coursesSnapshot.docs) {
      const data = doc.data();
      // Supprimer si title contient "Test" ou si id commence par "test-"
      if ((data.title && data.title.includes('Test')) || doc.id.startsWith('test-')) {
        await db.collection('courses').doc(doc.id).delete();
        console.log(`  ✓ Cours supprimé: ${doc.id} (${data.title || ''})`);
        coursesDeleted++;
      }
    }
    console.log(`✅ ${coursesDeleted} cours de test supprimés\n`);

    // 3. Supprimer les chapitres de test
    console.log('📖 Suppression des chapitres de test...');
    const chaptersSnapshot = await db.collection('chapters').get();
    let chaptersDeleted = 0;
    
    for (const doc of chaptersSnapshot.docs) {
      const data = doc.data();
      if ((data.title && data.title.includes('Test')) || 
          (data.courseId && data.courseId.startsWith('test-'))) {
        await db.collection('chapters').doc(doc.id).delete();
        console.log(`  ✓ Chapitre supprimé: ${doc.id} (${data.title || ''})`);
        chaptersDeleted++;
      }
    }
    console.log(`✅ ${chaptersDeleted} chapitres de test supprimés\n`);

    // 4. Supprimer les leçons de test
    console.log('📝 Suppression des leçons de test...');
    const lessonsSnapshot = await db.collection('lessons').get();
    let lessonsDeleted = 0;
    
    for (const doc of lessonsSnapshot.docs) {
      const data = doc.data();
      if ((data.title && data.title.includes('Test')) || 
          (data.courseId && data.courseId.startsWith('test-')) ||
          (data.chapterId && data.chapterId.startsWith('test-'))) {
        await db.collection('lessons').doc(doc.id).delete();
        console.log(`  ✓ Leçon supprimée: ${doc.id} (${data.title || ''})`);
        lessonsDeleted++;
      }
    }
    console.log(`✅ ${lessonsDeleted} leçons de test supprimées\n`);

    // 5. Supprimer les exercices de test
    console.log('✏️ Suppression des exercices de test...');
    const exercisesSnapshot = await db.collection('exercises').get();
    let exercisesDeleted = 0;
    
    for (const doc of exercisesSnapshot.docs) {
      const data = doc.data();
      if ((data.title && data.title.includes('Test')) || 
          (data.courseId && data.courseId.startsWith('test-')) ||
          (data.chapterId && data.chapterId.startsWith('test-'))) {
        await db.collection('exercises').doc(doc.id).delete();
        console.log(`  ✓ Exercice supprimé: ${doc.id} (${data.title || ''})`);
        exercisesDeleted++;
      }
    }
    console.log(`✅ ${exercisesDeleted} exercices de test supprimés\n`);

    // 6. Supprimer les instructeurs de test
    console.log('👨‍🏫 Suppression des instructeurs de test...');
    const instructorsSnapshot = await db.collection('instructors').get();
    let instructorsDeleted = 0;
    
    for (const doc of instructorsSnapshot.docs) {
      const data = doc.data();
      // Supprimer si name contient "Test", "TEST", "TO DELETE" ou id commence par "test-"
      if ((data.name && (data.name.includes('Test') || data.name.includes('TEST') || data.name.includes('TO DELETE'))) || 
          (data.bio && data.bio.includes('Test')) ||
          doc.id.startsWith('test-')) {
        await db.collection('instructors').doc(doc.id).delete();
        console.log(`  ✓ Instructeur supprimé: ${doc.id} (${data.name || ''})`);
        instructorsDeleted++;
      }
    }
    console.log(`✅ ${instructorsDeleted} instructeurs de test supprimés\n`);

    // 7. Supprimer les inscriptions de test
    console.log('📋 Suppression des inscriptions de test...');
    const enrollmentsSnapshot = await db.collection('enrollments').get();
    let enrollmentsDeleted = 0;
    
    for (const doc of enrollmentsSnapshot.docs) {
      const data = doc.data();
      // Supprimer si userId ou courseId contient "test"
      if ((data.userId && data.userId.includes('test')) || 
          (data.courseId && data.courseId.includes('test'))) {
        await db.collection('enrollments').doc(doc.id).delete();
        console.log(`  ✓ Inscription supprimée: ${doc.id} (user: ${data.userId}, course: ${data.courseId})`);
        enrollmentsDeleted++;
      }
    }
    console.log(`✅ ${enrollmentsDeleted} inscriptions de test supprimées\n`);

    // Résumé
    console.log('═══════════════════════════════════════════════');
    console.log('📊 RÉSUMÉ DU NETTOYAGE');
    console.log('═══════════════════════════════════════════════');
    console.log(`👥 Utilisateurs:    ${usersDeleted} supprimés`);
    console.log(`📚 Cours:           ${coursesDeleted} supprimés`);
    console.log(`📖 Chapitres:       ${chaptersDeleted} supprimés`);
    console.log(`📝 Leçons:          ${lessonsDeleted} supprimées`);
    console.log(`✏️  Exercices:       ${exercisesDeleted} supprimés`);
    console.log(`👨‍🏫 Instructeurs:    ${instructorsDeleted} supprimés`);
    console.log(`📋 Inscriptions:    ${enrollmentsDeleted} supprimées`);
    console.log('═══════════════════════════════════════════════');
    console.log(`🎉 Total: ${usersDeleted + coursesDeleted + chaptersDeleted + lessonsDeleted + exercisesDeleted + instructorsDeleted + enrollmentsDeleted} documents supprimés`);
    console.log('\n✅ Nettoyage terminé avec succès!');

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
    process.exit(1);
  }

  process.exit(0);
}

// Exécuter le nettoyage
cleanupTestData();
