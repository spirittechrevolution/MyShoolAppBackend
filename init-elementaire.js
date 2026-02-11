/**
 * Script d'initialisation pour les classes élémentaires CE1, CE2, CM1
 * Crée les matières, cours et chapitres manquants
 * 
 * Usage: node init-elementaire.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialiser Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();
db.settings({ 
  databaseId: 'myschool-1',
  ignoreUndefinedProperties: true 
});

// Matières pour chaque classe élémentaire
const MATIERES_ELEMENTAIRE = {
  'CE1': [
    { nom: 'Mathématiques', icone: '🔢', description: 'Découvrir les nombres et calculs' },
    { nom: 'Français', icone: '📚', description: 'Apprendre à lire, écrire et parler' },
    { nom: 'Sciences', icone: '🔬', description: 'Explorer le monde qui nous entoure' },
    { nom: 'Histoire-Géographie', icone: '🌍', description: 'Découvrir le temps et l\'espace' },
    { nom: 'Arts plastiques', icone: '🎨', description: 'Créer et s\'exprimer par l\'art' },
    { nom: 'Éducation physique', icone: '⚽', description: 'Développer son corps et sa santé' }
  ],
  'CE2': [
    { nom: 'Mathématiques', icone: '🔢', description: 'Approfondir les calculs et la géométrie' },
    { nom: 'Français', icone: '📚', description: 'Perfectionner lecture et expression écrite' },
    { nom: 'Sciences', icone: '🔬', description: 'Comprendre les phénomènes naturels' },
    { nom: 'Histoire-Géographie', icone: '🌍', description: 'Situer dans le temps et l\'espace' },
    { nom: 'Anglais', icone: '🇬🇧', description: 'Premiers pas en langue anglaise' },
    { nom: 'Arts plastiques', icone: '🎨', description: 'Développer sa créativité artistique' },
    { nom: 'Éducation physique', icone: '⚽', description: 'Sport et développement moteur' }
  ],
  'CM1': [
    { nom: 'Mathématiques', icone: '🔢', description: 'Maîtriser les opérations et la géométrie' },
    { nom: 'Français', icone: '📚', description: 'Grammaire, conjugaison et rédaction' },
    { nom: 'Sciences', icone: '🔬', description: 'Sciences de la vie et de la Terre' },
    { nom: 'Histoire-Géographie', icone: '🌍', description: 'Histoire de France et géographie régionale' },
    { nom: 'Anglais', icone: '🇬🇧', description: 'Communication en langue anglaise' },
    { nom: 'Arts plastiques', icone: '🎨', description: 'Création et expression artistique' },
    { nom: 'Éducation physique', icone: '⚽', description: 'Sports collectifs et individuels' },
    { nom: 'Informatique', icone: '💻', description: 'Premiers pas avec l\'ordinateur' }
  ]
};

// Templates de cours par matière
const COURSE_TEMPLATES = {
  'Mathématiques': [
    {
      title: 'Les nombres et le calcul',
      category: 'Nombres',
      description: 'Apprendre à compter, calculer et résoudre des problèmes',
      type: 'VIDEO',
      level: 'DEBUTANT',
      duration: 90,
      sessions: 10,
      exercises: 20
    },
    {
      title: 'Géométrie et mesures',
      category: 'Géométrie',
      description: 'Découvrir les formes et apprendre à mesurer',
      type: 'En ligne',
      level: 'DEBUTANT',
      duration: 80,
      sessions: 8,
      exercises: 15
    }
  ],
  'Français': [
    {
      title: 'Lecture et compréhension',
      category: 'Lecture',
      description: 'Apprendre à lire et comprendre des textes',
      type: 'VIDEO',
      level: 'DEBUTANT',
      duration: 100,
      sessions: 12,
      exercises: 25
    },
    {
      title: 'Écriture et orthographe',
      category: 'Écriture',
      description: 'Bien écrire et respecter l\'orthographe',
      type: 'En ligne',
      level: 'DEBUTANT',
      duration: 90,
      sessions: 10,
      exercises: 30
    }
  ],
  'Sciences': [
    {
      title: 'La nature et les êtres vivants',
      category: 'Biologie',
      description: 'Découvrir les animaux, les plantes et leur environnement',
      type: 'VIDEO',
      level: 'DEBUTANT',
      duration: 70,
      sessions: 8,
      exercises: 15
    }
  ],
  'Histoire-Géographie': [
    {
      title: 'Le temps et l\'espace',
      category: 'Repères',
      description: 'Se situer dans le temps et dans l\'espace',
      type: 'En ligne',
      level: 'DEBUTANT',
      duration: 60,
      sessions: 6,
      exercises: 12
    }
  ],
  'Anglais': [
    {
      title: 'Mes premiers mots en anglais',
      category: 'Vocabulaire',
      description: 'Apprendre les mots de base en anglais',
      type: 'VIDEO',
      level: 'DEBUTANT',
      duration: 50,
      sessions: 6,
      exercises: 10
    }
  ],
  'Arts plastiques': [
    {
      title: 'Création artistique',
      category: 'Expression',
      description: 'Dessiner, peindre et créer des œuvres d\'art',
      type: 'Hybrid',
      level: 'DEBUTANT',
      duration: 60,
      sessions: 8,
      exercises: 5
    }
  ],
  'Éducation physique': [
    {
      title: 'Sport et santé',
      category: 'Motricité',
      description: 'Développer ses capacités physiques et sportives',
      type: 'VIDEO',
      level: 'DEBUTANT',
      duration: 45,
      sessions: 10,
      exercises: 8
    }
  ],
  'Informatique': [
    {
      title: 'Découverte de l\'ordinateur',
      category: 'Bureautique',
      description: 'Apprendre à utiliser un ordinateur',
      type: 'En ligne',
      level: 'DEBUTANT',
      duration: 40,
      sessions: 5,
      exercises: 8
    }
  ]
};

// Chapitres par défaut (adaptés au niveau élémentaire)
const CHAPTERS_ELEMENTAIRE = [
  {
    title: 'Découverte',
    description: 'Introduction et premières notions',
    duration: '1h 30min',
    lessons: [
      { title: 'Présentation', type: 'video', duration: '10min' },
      { title: 'Les bases', type: 'video', duration: '20min' },
      { title: 'Activité découverte', type: 'text', duration: '15min' },
      { title: 'Quiz découverte', type: 'quiz', duration: '15min' }
    ],
    exercises: [
      { title: 'Exercices de découverte', type: 'qcm', difficulty: 'facile', duration: '10min' }
    ]
  },
  {
    title: 'Apprentissage',
    description: 'Apprendre et pratiquer',
    duration: '2h 00min',
    lessons: [
      { title: 'Leçon principale', type: 'video', duration: '25min' },
      { title: 'Exemples pratiques', type: 'video', duration: '20min' },
      { title: 'À retenir', type: 'text', duration: '15min' },
      { title: 'Vérification', type: 'quiz', duration: '20min' }
    ],
    exercises: [
      { title: 'Exercices d\'application', type: 'qcm', difficulty: 'facile', duration: '15min' },
      { title: 'Problèmes simples', type: 'qcm', difficulty: 'moyen', duration: '20min' }
    ]
  },
  {
    title: 'Entraînement',
    description: 'S\'entraîner pour bien maîtriser',
    duration: '1h 45min',
    lessons: [
      { title: 'Révisions', type: 'video', duration: '20min' },
      { title: 'Nouveaux exemples', type: 'video', duration: '25min' },
      { title: 'Conseils et astuces', type: 'text', duration: '20min' }
    ],
    exercises: [
      { title: 'Entraînement progressif', type: 'qcm', difficulty: 'moyen', duration: '25min' },
      { title: 'Défis amusants', type: 'qcm', difficulty: 'difficile', duration: '20min' }
    ]
  },
  {
    title: 'Évaluation',
    description: 'Vérifier ce qui a été appris',
    duration: '1h 15min',
    lessons: [
      { title: 'Ce qu\'il faut savoir', type: 'video', duration: '15min' },
      { title: 'Résumé du cours', type: 'text', duration: '15min' },
      { title: 'Test final', type: 'quiz', duration: '30min' }
    ],
    exercises: [
      { title: 'Évaluation finale', type: 'qcm', difficulty: 'moyen', duration: '30min' }
    ]
  }
];

/**
 * Créer les matières pour une classe
 */
async function createMatieres(classe) {
  console.log(`\n📚 Création des matières pour ${classe}`);
  const matieres = MATIERES_ELEMENTAIRE[classe];
  const matieresIds = {};
  
  for (const matiereData of matieres) {
    const existingMatiere = await db.collection('matieres')
      .where('nom', '==', matiereData.nom)
      .where('classe', '==', classe)
      .where('niveauScolaire', '==', 'ELEMENTAIRE')
      .get();
    
    if (!existingMatiere.empty) {
      const existing = existingMatiere.docs[0];
      matieresIds[matiereData.nom] = existing.id;
      console.log(`   ⚠️  ${matiereData.nom} existe déjà`);
      continue;
    }
    
    const matiere = {
      nom: matiereData.nom,
      niveauScolaire: 'ELEMENTAIRE',
      classe: classe,
      description: matiereData.description,
      icone: matiereData.icone,
      ordre: Object.keys(matieresIds).length + 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const docRef = await db.collection('matieres').add(matiere);
    matieresIds[matiereData.nom] = docRef.id;
    console.log(`   ✅ ${matiereData.nom} créée`);
  }
  
  return matieresIds;
}

/**
 * Créer les cours pour une classe
 */
async function createCourses(classe, matieresIds) {
  console.log(`\n🎓 Création des cours pour ${classe}`);
  const coursesIds = [];
  
  for (const [matiereNom, templates] of Object.entries(COURSE_TEMPLATES)) {
    if (!matieresIds[matiereNom]) continue;
    
    const matiereTemplates = templates || [COURSE_TEMPLATES['Sciences'][0]]; // Template par défaut
    
    for (const template of matiereTemplates) {
      const existingCourse = await db.collection('courses')
        .where('title', '==', `${template.title} - ${classe}`)
        .where('classe', '==', classe)
        .get();
      
      if (!existingCourse.empty) {
        coursesIds.push(existingCourse.docs[0].id);
        console.log(`   ⚠️  ${template.title} - ${classe} existe déjà`);
        continue;
      }
      
      const courseData = {
        title: `${template.title} - ${classe}`,
        description: template.description,
        niveauScolaire: 'ELEMENTAIRE',
        matiereId: matieresIds[matiereNom],
        classe: classe,
        category: template.category,
        type: template.type,
        level: template.level,
        duration: template.duration,
        sessions: template.sessions,
        price: 0, // Gratuit pour l'élémentaire
        rating: (Math.random() * 2 + 3).toFixed(1),
        image: getImageForSubject(matiereNom),
        isPublished: true,
        certificateAvailable: false, // Pas de certificat en élémentaire
        chaptersIds: [],
        chapters: [],
        exercises: template.exercises,
        enrolledUsers: [],
        documents: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const courseRef = await db.collection('courses').add(courseData);
      coursesIds.push(courseRef.id);
      console.log(`   ✅ ${template.title} - ${classe} créé`);
    }
  }
  
  return coursesIds;
}

/**
 * Créer les chapitres pour un cours
 */
async function createChaptersForCourse(courseId, courseTitle) {
  const chaptersIds = [];
  
  for (let i = 0; i < CHAPTERS_ELEMENTAIRE.length; i++) {
    const chapterTemplate = CHAPTERS_ELEMENTAIRE[i];
    
    const chapterData = {
      courseId: courseId,
      title: chapterTemplate.title,
      description: chapterTemplate.description,
      duration: chapterTemplate.duration,
      order: i + 1,
      lessonsIds: [],
      exercisesIds: []
    };
    
    const chapterRef = await db.collection('chapters').add(chapterData);
    const chapterId = chapterRef.id;
    
    // Créer les leçons
    const lessonIds = await createLessonsForChapter(courseId, chapterId, chapterTemplate.lessons);
    
    // Créer les exercices  
    const exerciseIds = await createExercisesForChapter(courseId, chapterId, chapterTemplate.exercises);
    
    // Mettre à jour le chapitre avec les IDs
    await chapterRef.update({
      lessonsIds: lessonIds,
      exercisesIds: exerciseIds
    });
    
    chaptersIds.push(chapterId);
  }
  
  return chaptersIds;
}

/**
 * Créer les leçons pour un chapitre
 */
async function createLessonsForChapter(courseId, chapterId, lessonsTemplate) {
  const lessonIds = [];
  
  for (let i = 0; i < lessonsTemplate.length; i++) {
    const lessonTemplate = lessonsTemplate[i];
    
    const lessonData = {
      courseId: courseId,
      chapterId: chapterId,
      title: lessonTemplate.title,
      type: lessonTemplate.type,
      duration: lessonTemplate.duration,
      order: i + 1,
      videoUrl: lessonTemplate.type === 'video' 
        ? `https://storage.example.com/courses/${courseId}/chapters/${chapterId}/lesson${i + 1}.mp4`
        : undefined,
      content: lessonTemplate.type === 'text' 
        ? `Contenu de la leçon : ${lessonTemplate.title}`
        : undefined
    };
    
    const lessonRef = await db.collection('lessons').add(lessonData);
    lessonIds.push(lessonRef.id);
  }
  
  return lessonIds;
}

/**
 * Créer les exercices pour un chapitre
 */
async function createExercisesForChapter(courseId, chapterId, exercisesTemplate) {
  const exerciseIds = [];
  
  for (const exerciseTemplate of exercisesTemplate) {
    const questions = generateQuestionsForElementary(exerciseTemplate.title, exerciseTemplate.difficulty);
    
    const exerciseData = {
      courseId: courseId,
      chapterId: chapterId,
      title: exerciseTemplate.title,
      type: exerciseTemplate.type,
      difficulty: exerciseTemplate.difficulty,
      duration: exerciseTemplate.duration,
      instructions: `Instructions pour : ${exerciseTemplate.title}`,
      questions: questions,
      documents: [
        {
          name: `${exerciseTemplate.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
          url: `https://storage.example.com/courses/${courseId}/chapters/${chapterId}/exercises/${exerciseTemplate.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
          uploadedAt: new Date()
        }
      ]
    };
    
    const exerciseRef = await db.collection('exercises').add(exerciseData);
    exerciseIds.push(exerciseRef.id);
  }
  
  return exerciseIds;
}

/**
 * Générer des questions adaptées à l'élémentaire
 */
function generateQuestionsForElementary(title, difficulty) {
  const numQuestions = difficulty === 'facile' ? 3 : difficulty === 'moyen' ? 5 : 7;
  const questions = [];
  
  for (let i = 1; i <= numQuestions; i++) {
    questions.push({
      id: `q${i}`,
      question: `Question ${i} sur ${title}`,
      options: [
        'Réponse A',
        'Réponse B', 
        'Réponse C'
      ],
      correctAnswer: 'Réponse A'
    });
  }
  
  return questions;
}

/**
 * Obtenir l'image selon la matière
 */
function getImageForSubject(subject) {
  const images = {
    'Mathématiques': 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800',
    'Français': 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800',
    'Sciences': 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800',
    'Histoire-Géographie': 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800',
    'Anglais': 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800',
    'Arts plastiques': 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800',
    'Éducation physique': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
    'Informatique': 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800'
  };
  return images[subject] || 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800';
}

/**
 * Traiter une classe complète
 */
async function processClasse(classe) {
  console.log(`\n🏫 === TRAITEMENT DE LA CLASSE ${classe} ===`);
  
  try {
    // 1. Créer les matières
    const matieresIds = await createMatieres(classe);
    
    // 2. Créer les cours
    const coursesIds = await createCourses(classe, matieresIds);
    
    // 3. Créer les chapitres pour chaque cours
    console.log(`\n📖 Création des chapitres pour ${classe}`);
    for (const courseId of coursesIds) {
      // Récupérer le titre du cours
      const courseDoc = await db.collection('courses').doc(courseId).get();
      const courseTitle = courseDoc.data().title;
      
      // Vérifier si le cours a déjà des chapitres
      if (courseDoc.data().chaptersIds && courseDoc.data().chaptersIds.length > 0) {
        console.log(`   ⚠️  ${courseTitle} a déjà des chapitres`);
        continue;
      }
      
      const chaptersIds = await createChaptersForCourse(courseId, courseTitle);
      
      // Mettre à jour le cours avec les IDs des chapitres
      await db.collection('courses').doc(courseId).update({
        chaptersIds: chaptersIds,
        updatedAt: new Date()
      });
      
      console.log(`   ✅ ${courseTitle} : ${chaptersIds.length} chapitres créés`);
    }
    
    console.log(`\n✅ Classe ${classe} terminée !`);
    return {
      matieres: Object.keys(matieresIds).length,
      cours: coursesIds.length,
      chapitres: coursesIds.length * CHAPTERS_ELEMENTAIRE.length
    };
    
  } catch (error) {
    console.error(`❌ Erreur pour ${classe}:`, error);
    return null;
  }
}

/**
 * Fonction principale
 */
async function initElementaire() {
  console.log('🚀 INITIALISATION CLASSES ÉLÉMENTAIRES');
  console.log('=' .repeat(60));
  
  const classes = ['CE1', 'CE2', 'CM1'];
  const results = {};
  
  for (const classe of classes) {
    results[classe] = await processClasse(classe);
  }
  
  // Statistiques finales
  console.log('\n' + '='.repeat(60));
  console.log('📊 RÉSULTATS FINAUX');
  console.log('='.repeat(60));
  
  let totalMatieres = 0, totalCours = 0, totalChapitres = 0;
  
  for (const [classe, result] of Object.entries(results)) {
    if (result) {
      console.log(`${classe}: ${result.matieres} matières, ${result.cours} cours, ${result.chapitres} chapitres`);
      totalMatieres += result.matieres;
      totalCours += result.cours;
      totalChapitres += result.chapitres;
    }
  }
  
  console.log(`\nTOTAL: ${totalMatieres} matières, ${totalCours} cours, ${totalChapitres} chapitres`);
  console.log('\n✨ Initialisation terminée !');
}

// Exécution
initElementaire()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Erreur fatale:', error);
    process.exit(1);
  });