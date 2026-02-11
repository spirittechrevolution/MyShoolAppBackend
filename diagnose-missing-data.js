/**
 * Script de diagnostic pour identifier les données manquantes dans Firestore
 * Vérifie l'intégrité des relations entre cours, chapitres, leçons et exercices
 * 
 * Usage: node diagnose-missing-data.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialiser Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
db.settings({ 
  databaseId: 'myschool-1',
  ignoreUndefinedProperties: true 
});

/**
 * Analyser les cours
 */
async function analyzeCourses() {
  console.log('\n📚 ANALYSE DES COURS');
  console.log('='.repeat(60));
  
  const coursesSnapshot = await db.collection('courses').get();
  const stats = {
    total: coursesSnapshot.size,
    withChapters: 0,
    withoutChapters: 0,
    withDocuments: 0,
    withoutDocuments: 0,
    published: 0,
    unpublished: 0,
    byLevel: {},
    bySubject: {}
  };
  
  const coursesWithoutChapters = [];
  const coursesWithoutDocuments = [];
  
  for (const doc of coursesSnapshot.docs) {
    const course = { id: doc.id, ...doc.data() };
    
    // Chapitres
    if (course.chaptersIds && course.chaptersIds.length > 0) {
      stats.withChapters++;
    } else {
      stats.withoutChapters++;
      coursesWithoutChapters.push({
        id: course.id,
        title: course.title,
        niveau: course.niveauScolaire,
        classe: course.classe
      });
    }
    
    // Documents
    if (course.documents && course.documents.length > 0) {
      stats.withDocuments++;
    } else {
      stats.withoutDocuments++;
      coursesWithoutDocuments.push({
        id: course.id,
        title: course.title
      });
    }
    
    // Publié/Non publié
    if (course.isPublished) {
      stats.published++;
    } else {
      stats.unpublished++;
    }
    
    // Par niveau scolaire
    const niveau = course.niveauScolaire || 'NON_DEFINI';
    stats.byLevel[niveau] = (stats.byLevel[niveau] || 0) + 1;
    
    // Par matière (approximatif depuis le titre)
    const matiere = course.matiereId || extractSubject(course.title);
    stats.bySubject[matiere] = (stats.bySubject[matiere] || 0) + 1;
  }
  
  console.log(`Total de cours: ${stats.total}`);
  console.log(`\n📊 Structure:`);
  console.log(`   ✅ Avec chapitres: ${stats.withChapters}`);
  console.log(`   ❌ Sans chapitres: ${stats.withoutChapters}`);
  console.log(`   📄 Avec documents: ${stats.withDocuments}`);
  console.log(`   📄 Sans documents: ${stats.withoutDocuments}`);
  
  console.log(`\n📖 Publication:`);
  console.log(`   ✅ Publiés: ${stats.published}`);
  console.log(`   ⏳ Non publiés: ${stats.unpublished}`);
  
  console.log(`\n🎓 Par niveau scolaire:`);
  for (const [niveau, count] of Object.entries(stats.byLevel)) {
    console.log(`   ${niveau}: ${count}`);
  }
  
  console.log(`\n📚 Par matière:`);
  for (const [matiere, count] of Object.entries(stats.bySubject)) {
    console.log(`   ${matiere}: ${count}`);
  }
  
  if (coursesWithoutChapters.length > 0) {
    console.log(`\n⚠️  Cours sans chapitres (${coursesWithoutChapters.length}):`);
    coursesWithoutChapters.slice(0, 10).forEach(course => {
      console.log(`   - ${course.title} [${course.niveau}${course.classe ? ' - ' + course.classe : ''}]`);
    });
    if (coursesWithoutChapters.length > 10) {
      console.log(`   ... et ${coursesWithoutChapters.length - 10} autres`);
    }
  }
  
  return stats;
}

/**
 * Analyser les chapitres
 */
async function analyzeChapters() {
  console.log('\n\n📖 ANALYSE DES CHAPITRES');
  console.log('='.repeat(60));
  
  const chaptersSnapshot = await db.collection('chapters').get();
  const stats = {
    total: chaptersSnapshot.size,
    withLessons: 0,
    withoutLessons: 0,
    withExercises: 0,
    withoutExercises: 0,
    orphaned: 0
  };
  
  const chaptersWithoutLessons = [];
  const chaptersWithoutExercises = [];
  const orphanedChapters = [];
  
  // Récupérer tous les IDs de cours pour vérifier les orphelins
  const coursesSnapshot = await db.collection('courses').get();
  const courseIds = new Set(coursesSnapshot.docs.map(doc => doc.id));
  
  for (const doc of chaptersSnapshot.docs) {
    const chapter = { id: doc.id, ...doc.data() };
    
    // Vérifier si le chapitre est orphelin
    if (!courseIds.has(chapter.courseId)) {
      stats.orphaned++;
      orphanedChapters.push({
        id: chapter.id,
        title: chapter.title,
        courseId: chapter.courseId
      });
    }
    
    // Leçons
    if (chapter.lessonsIds && chapter.lessonsIds.length > 0) {
      stats.withLessons++;
    } else {
      stats.withoutLessons++;
      chaptersWithoutLessons.push({
        id: chapter.id,
        title: chapter.title,
        courseId: chapter.courseId
      });
    }
    
    // Exercices
    if (chapter.exercisesIds && chapter.exercisesIds.length > 0) {
      stats.withExercises++;
    } else {
      stats.withoutExercises++;
      chaptersWithoutExercises.push({
        id: chapter.id,
        title: chapter.title,
        courseId: chapter.courseId
      });
    }
  }
  
  console.log(`Total de chapitres: ${stats.total}`);
  console.log(`\n📊 Structure:`);
  console.log(`   ✅ Avec leçons: ${stats.withLessons}`);
  console.log(`   ❌ Sans leçons: ${stats.withoutLessons}`);
  console.log(`   ✅ Avec exercices: ${stats.withExercises}`);
  console.log(`   ❌ Sans exercices: ${stats.withoutExercises}`);
  console.log(`   ⚠️  Orphelins (cours supprimé): ${stats.orphaned}`);
  
  if (orphanedChapters.length > 0) {
    console.log(`\n⚠️  Chapitres orphelins à supprimer:`);
    orphanedChapters.forEach(chapter => {
      console.log(`   - ${chapter.title} (courseId: ${chapter.courseId})`);
    });
  }
  
  return stats;
}

/**
 * Analyser les leçons
 */
async function analyzeLessons() {
  console.log('\n\n🎬 ANALYSE DES LEÇONS');
  console.log('='.repeat(60));
  
  const lessonsSnapshot = await db.collection('lessons').get();
  const stats = {
    total: lessonsSnapshot.size,
    byType: {},
    orphaned: 0,
    withVideo: 0,
    withoutVideo: 0
  };
  
  const orphanedLessons = [];
  
  // Récupérer tous les IDs de chapitres pour vérifier les orphelins
  const chaptersSnapshot = await db.collection('chapter').get();
  const chapterIds = new Set(chaptersSnapshot.docs.map(doc => doc.id));
  
  for (const doc of lessonsSnapshot.docs) {
    const lesson = { id: doc.id, ...doc.data() };
    
    // Vérifier si la leçon est orpheline
    if (!chapterIds.has(lesson.chapterId)) {
      stats.orphaned++;
      orphanedLessons.push({
        id: lesson.id,
        title: lesson.title,
        chapterId: lesson.chapterId
      });
    }
    
    // Par type
    const type = lesson.type || 'NON_DEFINI';
    stats.byType[type] = (stats.byType[type] || 0) + 1;
    
    // Avec/sans vidéo
    if (lesson.type === 'video') {
      if (lesson.videoUrl && !lesson.videoUrl.includes('example.com')) {
        stats.withVideo++;
      } else {
        stats.withoutVideo++;
      }
    }
  }
  
  console.log(`Total de leçons: ${stats.total}`);
  console.log(`\n📊 Par type:`);
  for (const [type, count] of Object.entries(stats.byType)) {
    console.log(`   ${type}: ${count}`);
  }
  
  if (stats.byType['video']) {
    console.log(`\n🎥 Leçons vidéo:`);
    console.log(`   ✅ Avec URL réelle: ${stats.withVideo}`);
    console.log(`   ⚠️  Avec placeholder: ${stats.withoutVideo}`);
  }
  
  console.log(`   ⚠️  Orphelines (chapitre supprimé): ${stats.orphaned}`);
  
  if (orphanedLessons.length > 0) {
    console.log(`\n⚠️  Leçons orphelines à supprimer:`);
    orphanedLessons.slice(0, 5).forEach(lesson => {
      console.log(`   - ${lesson.title} (chapterId: ${lesson.chapterId})`);
    });
    if (orphanedLessons.length > 5) {
      console.log(`   ... et ${orphanedLessons.length - 5} autres`);
    }
  }
  
  return stats;
}

/**
 * Analyser les exercices
 */
async function analyzeExercises() {
  console.log('\n\n✏️  ANALYSE DES EXERCICES');
  console.log('='.repeat(60));
  
  const exercisesSnapshot = await db.collection('exercises').get();
  const stats = {
    total: exercisesSnapshot.size,
    byType: {},
    byDifficulty: {},
    withQuestions: 0,
    withoutQuestions: 0,
    withDocuments: 0,
    withoutDocuments: 0,
    orphaned: 0
  };
  
  const orphanedExercises = [];
  
  // Récupérer tous les IDs de chapitres pour vérifier les orphelins
  const chaptersSnapshot = await db.collection('chapter').get();
  const chapterIds = new Set(chaptersSnapshot.docs.map(doc => doc.id));
  
  for (const doc of exercisesSnapshot.docs) {
    const exercise = { id: doc.id, ...doc.data() };
    
    // Vérifier si l'exercice est orphelin
    if (!chapterIds.has(exercise.chapterId)) {
      stats.orphaned++;
      orphanedExercises.push({
        id: exercise.id,
        title: exercise.title,
        chapterId: exercise.chapterId
      });
    }
    
    // Par type
    const type = exercise.type || 'NON_DEFINI';
    stats.byType[type] = (stats.byType[type] || 0) + 1;
    
    // Par difficulté
    const difficulty = exercise.difficulty || 'NON_DEFINIE';
    stats.byDifficulty[difficulty] = (stats.byDifficulty[difficulty] || 0) + 1;
    
    // Questions
    if (exercise.questions && exercise.questions.length > 0) {
      stats.withQuestions++;
    } else {
      stats.withoutQuestions++;
    }
    
    // Documents
    if (exercise.documents && exercise.documents.length > 0) {
      if (exercise.documents.some(doc => !doc.url.includes('example.com'))) {
        stats.withDocuments++;
      } else {
        stats.withoutDocuments++;
      }
    } else {
      stats.withoutDocuments++;
    }
  }
  
  console.log(`Total d'exercices: ${stats.total}`);
  console.log(`\n📊 Par type:`);
  for (const [type, count] of Object.entries(stats.byType)) {
    console.log(`   ${type}: ${count}`);
  }
  
  console.log(`\n📊 Par difficulté:`);
  for (const [difficulty, count] of Object.entries(stats.byDifficulty)) {
    console.log(`   ${difficulty}: ${count}`);
  }
  
  console.log(`\n❓ Questions:`);
  console.log(`   ✅ Avec questions: ${stats.withQuestions}`);
  console.log(`   ❌ Sans questions: ${stats.withoutQuestions}`);
  
  console.log(`\n📄 Documents:`);
  console.log(`   ✅ Avec documents réels: ${stats.withDocuments}`);
  console.log(`   ⚠️  Avec placeholders ou sans: ${stats.withoutDocuments}`);
  
  console.log(`   ⚠️  Orphelins (chapitre supprimé): ${stats.orphaned}`);
  
  if (orphanedExercises.length > 0) {
    console.log(`\n⚠️  Exercices orphelins à supprimer:`);
    orphanedExercises.slice(0, 5).forEach(exercise => {
      console.log(`   - ${exercise.title} (chapterId: ${exercise.chapterId})`);
    });
    if (orphanedExercises.length > 5) {
      console.log(`   ... et ${orphanedExercises.length - 5} autres`);
    }
  }
  
  return stats;
}

/**
 * Analyser les matières
 */
async function analyzeMatieres() {
  console.log('\n\n📚 ANALYSE DES MATIÈRES');
  console.log('='.repeat(60));
  
  const matieresSnapshot = await db.collection('matieres').get();
  const stats = {
    total: matieresSnapshot.size,
    active: 0,
    inactive: 0,
    byLevel: {}
  };
  
  for (const doc of matieresSnapshot.docs) {
    const matiere = { id: doc.id, ...doc.data() };
    
    if (matiere.isActive) {
      stats.active++;
    } else {
      stats.inactive++;
    }
    
    const niveau = matiere.niveauScolaire || 'NON_DEFINI';
    stats.byLevel[niveau] = (stats.byLevel[niveau] || 0) + 1;
  }
  
  console.log(`Total de matières: ${stats.total}`);
  console.log(`   ✅ Actives: ${stats.active}`);
  console.log(`   ❌ Inactives: ${stats.inactive}`);
  
  console.log(`\n📊 Par niveau:`);
  for (const [niveau, count] of Object.entries(stats.byLevel)) {
    console.log(`   ${niveau}: ${count}`);
  }
  
  return stats;
}

/**
 * Extraire la matière du titre du cours
 */
function extractSubject(title) {
  const subjects = ['Mathématiques', 'Physique', 'Chimie', 'SVT', 'Français', 'Anglais', 'Histoire', 'Géographie'];
  for (const subject of subjects) {
    if (title.includes(subject)) {
      return subject;
    }
  }
  return 'Autre';
}

/**
 * Recommandations
 */
function showRecommendations(courseStats, chapterStats, lessonStats, exerciseStats) {
  console.log('\n\n💡 RECOMMANDATIONS');
  console.log('='.repeat(60));
  
  const recommendations = [];
  
  if (courseStats.withoutChapters > 0) {
    recommendations.push({
      priority: 'HAUTE',
      action: `Exécuter init-chapters-complete.js pour créer des chapitres`,
      detail: `${courseStats.withoutChapters} cours sans chapitres`
    });
  }
  
  if (chapterStats.orphaned > 0) {
    recommendations.push({
      priority: 'HAUTE',
      action: 'Supprimer les chapitres orphelins',
      detail: `${chapterStats.orphaned} chapitres référencent des cours supprimés`
    });
  }
  
  if (lessonStats.orphaned > 0) {
    recommendations.push({
      priority: 'HAUTE',
      action: 'Supprimer les leçons orphelines',
      detail: `${lessonStats.orphaned} leçons référencent des chapitres supprimés`
    });
  }
  
  if (exerciseStats.orphaned > 0) {
    recommendations.push({
      priority: 'HAUTE',
      action: 'Supprimer les exercices orphelins',
      detail: `${exerciseStats.orphaned} exercices référencent des chapitres supprimés`
    });
  }
  
  if (lessonStats.withoutVideo > 0) {
    recommendations.push({
      priority: 'MOYENNE',
      action: 'Ajouter les URLs réelles des vidéos',
      detail: `${lessonStats.withoutVideo} leçons vidéo avec placeholder`
    });
  }
  
  if (exerciseStats.withoutDocuments > 0) {
    recommendations.push({
      priority: 'MOYENNE',
      action: 'Ajouter les documents PDF aux exercices',
      detail: `${exerciseStats.withoutDocuments} exercices sans documents`
    });
  }
  
  if (courseStats.withoutDocuments > 0) {
    recommendations.push({
      priority: 'BASSE',
      action: 'Ajouter des documents de support aux cours',
      detail: `${courseStats.withoutDocuments} cours sans documents`
    });
  }
  
  if (courseStats.unpublished > 0) {
    recommendations.push({
      priority: 'BASSE',
      action: 'Publier les cours prêts',
      detail: `${courseStats.unpublished} cours non publiés`
    });
  }
  
  // Afficher les recommandations par priorité
  const priorities = ['HAUTE', 'MOYENNE', 'BASSE'];
  for (const priority of priorities) {
    const items = recommendations.filter(r => r.priority === priority);
    if (items.length > 0) {
      console.log(`\n🔴 Priorité ${priority}:`);
      items.forEach(item => {
        console.log(`   ➤ ${item.action}`);
        console.log(`     ${item.detail}`);
      });
    }
  }
}

/**
 * Fonction principale
 */
async function diagnose() {
  console.log('\n' + '='.repeat(60));
  console.log('🔍 DIAGNOSTIC DES DONNÉES FIRESTORE');
  console.log('='.repeat(60));
  
  try {
    const courseStats = await analyzeCourses();
    const chapterStats = await analyzeChapters();
    const lessonStats = await analyzeLessons();
    const exerciseStats = await analyzeExercises();
    const matiereStats = await analyzeMatieres();
    
    showRecommendations(courseStats, chapterStats, lessonStats, exerciseStats);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Diagnostic terminé!');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
    throw error;
  }
}

// Exécution
diagnose()
  .then(() => {
    console.log('\n✨ Analyse complète terminée!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erreur fatale:', error);
    process.exit(1);
  });
