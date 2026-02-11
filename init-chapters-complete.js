/**
 * Script d'initialisation des chapitres pour tous les cours
 * Crée une structure complète : Chapitres -> Leçons -> Exercices
 * avec des relations logiques pour vidéos, PDF, exercices
 * 
 * Usage: node init-chapters-complete.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialiser Firebase Admin uniquement s'il n'est pas déjà initialisé
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

// Templates de chapitres par niveau et matière
const CHAPTER_TEMPLATES = {
  'Mathématiques': [
    {
      title: 'Introduction et concepts de base',
      description: 'Découvrir les fondamentaux et les notions essentielles',
      duration: '2h 30min',
      lessons: [
        { title: 'Présentation du cours', type: 'video', duration: '15min' },
        { title: 'Définitions et notations', type: 'video', duration: '25min' },
        { title: 'Exemples pratiques', type: 'text', duration: '30min' },
        { title: 'Quiz de compréhension', type: 'quiz', duration: '20min' }
      ],
      exercises: [
        { title: 'Exercices d\'application', type: 'qcm', difficulty: 'facile', duration: '15min' },
        { title: 'Problèmes guidés', type: 'qcm', difficulty: 'moyen', duration: '25min' }
      ]
    },
    {
      title: 'Applications et résolution de problèmes',
      description: 'Apprendre à résoudre des problèmes concrets',
      duration: '3h 00min',
      lessons: [
        { title: 'Méthodes de résolution', type: 'video', duration: '30min' },
        { title: 'Exemples corrigés', type: 'video', duration: '45min' },
        { title: 'Exercices types', type: 'text', duration: '35min' },
        { title: 'Évaluation intermédiaire', type: 'quiz', duration: '30min' }
      ],
      exercises: [
        { title: 'Exercices progressifs', type: 'qcm', difficulty: 'moyen', duration: '20min' },
        { title: 'Problèmes complexes', type: 'qcm', difficulty: 'difficile', duration: '30min' }
      ]
    },
    {
      title: 'Approfondissement et techniques avancées',
      description: 'Maîtriser les techniques avancées et cas particuliers',
      duration: '2h 45min',
      lessons: [
        { title: 'Techniques avancées', type: 'video', duration: '35min' },
        { title: 'Cas particuliers', type: 'video', duration: '30min' },
        { title: 'Applications pratiques', type: 'text', duration: '40min' }
      ],
      exercises: [
        { title: 'Exercices de synthèse', type: 'qcm', difficulty: 'difficile', duration: '35min' },
        { title: 'Défis avancés', type: 'qcm', difficulty: 'avancé', duration: '40min' }
      ]
    },
    {
      title: 'Révision et évaluation finale',
      description: 'Consolider les acquis et évaluer les compétences',
      duration: '2h 15min',
      lessons: [
        { title: 'Résumé du cours', type: 'video', duration: '25min' },
        { title: 'Points clés à retenir', type: 'text', duration: '20min' },
        { title: 'Méthodologie d\'examen', type: 'video', duration: '30min' },
        { title: 'Évaluation finale', type: 'quiz', duration: '45min' }
      ],
      exercises: [
        { title: 'Examen blanc', type: 'qcm', difficulty: 'difficile', duration: '45min' }
      ]
    }
  ],
  'Physique-Chimie': [
    {
      title: 'Concepts fondamentaux',
      description: 'Introduction aux principes de base',
      duration: '2h 40min',
      lessons: [
        { title: 'Introduction au cours', type: 'video', duration: '20min' },
        { title: 'Théories et lois', type: 'video', duration: '35min' },
        { title: 'Expériences classiques', type: 'video', duration: '30min' },
        { title: 'Vérification des connaissances', type: 'quiz', duration: '25min' }
      ],
      exercises: [
        { title: 'Exercices de base', type: 'qcm', difficulty: 'facile', duration: '20min' },
        { title: 'Applications simples', type: 'qcm', difficulty: 'moyen', duration: '30min' }
      ]
    },
    {
      title: 'Expériences et pratique',
      description: 'Travaux pratiques et applications',
      duration: '3h 15min',
      lessons: [
        { title: 'Protocoles expérimentaux', type: 'video', duration: '30min' },
        { title: 'Manipulations guidées', type: 'video', duration: '45min' },
        { title: 'Analyse de résultats', type: 'text', duration: '40min' },
        { title: 'Quiz pratique', type: 'quiz', duration: '25min' }
      ],
      exercises: [
        { title: 'Exercices expérimentaux', type: 'qcm', difficulty: 'moyen', duration: '25min' },
        { title: 'Problèmes appliqués', type: 'qcm', difficulty: 'difficile', duration: '30min' }
      ]
    },
    {
      title: 'Approfondissement théorique',
      description: 'Étude approfondie des phénomènes',
      duration: '2h 50min',
      lessons: [
        { title: 'Théories avancées', type: 'video', duration: '40min' },
        { title: 'Phénomènes complexes', type: 'video', duration: '35min' },
        { title: 'Applications industrielles', type: 'text', duration: '35min' }
      ],
      exercises: [
        { title: 'Exercices avancés', type: 'qcm', difficulty: 'difficile', duration: '35min' },
        { title: 'Problèmes de recherche', type: 'qcm', difficulty: 'avancé', duration: '40min' }
      ]
    },
    {
      title: 'Synthèse et évaluation',
      description: 'Bilan des connaissances acquises',
      duration: '2h 30min',
      lessons: [
        { title: 'Synthèse générale', type: 'video', duration: '30min' },
        { title: 'Fiches de révision', type: 'text', duration: '25min' },
        { title: 'Conseils méthodologiques', type: 'video', duration: '25min' },
        { title: 'Test final', type: 'quiz', duration: '50min' }
      ],
      exercises: [
        { title: 'Épreuve de synthèse', type: 'qcm', difficulty: 'difficile', duration: '50min' }
      ]
    }
  ],
  'SVT': [
    {
      title: 'Introduction à la biologie',
      description: 'Découverte du vivant et de ses caractéristiques',
      duration: '2h 35min',
      lessons: [
        { title: 'Le monde vivant', type: 'video', duration: '25min' },
        { title: 'Organisation du vivant', type: 'video', duration: '30min' },
        { title: 'Observations microscopiques', type: 'video', duration: '30min' },
        { title: 'Quiz d\'introduction', type: 'quiz', duration: '20min' }
      ],
      exercises: [
        { title: 'Reconnaissance des structures', type: 'qcm', difficulty: 'facile', duration: '15min' },
        { title: 'Exercices de classification', type: 'qcm', difficulty: 'moyen', duration: '25min' }
      ]
    },
    {
      title: 'Fonctionnement des organismes',
      description: 'Étude des fonctions vitales',
      duration: '3h 10min',
      lessons: [
        { title: 'Fonctions de nutrition', type: 'video', duration: '35min' },
        { title: 'Fonctions de relation', type: 'video', duration: '35min' },
        { title: 'Fonctions de reproduction', type: 'video', duration: '35min' },
        { title: 'Évaluation des fonctions', type: 'quiz', duration: '30min' }
      ],
      exercises: [
        { title: 'Exercices sur les fonctions', type: 'qcm', difficulty: 'moyen', duration: '25min' },
        { title: 'Cas d\'étude complexes', type: 'qcm', difficulty: 'difficile', duration: '30min' }
      ]
    },
    {
      title: 'Génétique et évolution',
      description: 'Comprendre l\'hérédité et l\'évolution des espèces',
      duration: '2h 55min',
      lessons: [
        { title: 'Bases de la génétique', type: 'video', duration: '35min' },
        { title: 'Hérédité et transmission', type: 'video', duration: '35min' },
        { title: 'Théories de l\'évolution', type: 'text', duration: '30min' }
      ],
      exercises: [
        { title: 'Exercices de génétique', type: 'qcm', difficulty: 'difficile', duration: '40min' },
        { title: 'Problèmes d\'évolution', type: 'qcm', difficulty: 'avancé', duration: '35min' }
      ]
    },
    {
      title: 'Bilan et évaluation',
      description: 'Révision générale et test final',
      duration: '2h 20min',
      lessons: [
        { title: 'Révision générale', type: 'video', duration: '30min' },
        { title: 'Concepts essentiels', type: 'text', duration: '20min' },
        { title: 'Préparation à l\'examen', type: 'video', duration: '25min' },
        { title: 'Examen final', type: 'quiz', duration: '45min' }
      ],
      exercises: [
        { title: 'Épreuve finale', type: 'qcm', difficulty: 'difficile', duration: '45min' }
      ]
    }
  ],
  'Français': [
    {
      title: 'Grammaire et conjugaison',
      description: 'Maîtriser les règles grammaticales et la conjugaison',
      duration: '2h 45min',
      lessons: [
        { title: 'Classes grammaticales', type: 'video', duration: '30min' },
        { title: 'Temps et modes', type: 'video', duration: '35min' },
        { title: 'Accords et exceptions', type: 'text', duration: '25min' },
        { title: 'Exercices de grammaire', type: 'quiz', duration: '25min' }
      ],
      exercises: [
        { title: 'Exercices de conjugaison', type: 'qcm', difficulty: 'facile', duration: '20min' },
        { title: 'Exercices d\'accord', type: 'qcm', difficulty: 'moyen', duration: '30min' }
      ]
    },
    {
      title: 'Lecture et compréhension',
      description: 'Développer les compétences de lecture et d\'analyse',
      duration: '3h 00min',
      lessons: [
        { title: 'Techniques de lecture', type: 'video', duration: '25min' },
        { title: 'Analyse de textes', type: 'video', duration: '40min' },
        { title: 'Genres littéraires', type: 'text', duration: '35min' },
        { title: 'Quiz de compréhension', type: 'quiz', duration: '30min' }
      ],
      exercises: [
        { title: 'Exercices de compréhension', type: 'qcm', difficulty: 'moyen', duration: '25min' },
        { title: 'Analyse approfondie', type: 'qcm', difficulty: 'difficile', duration: '35min' }
      ]
    },
    {
      title: 'Expression écrite',
      description: 'Améliorer la rédaction et l\'argumentation',
      duration: '2h 50min',
      lessons: [
        { title: 'Méthodologie de la rédaction', type: 'video', duration: '30min' },
        { title: 'Techniques d\'argumentation', type: 'video', duration: '35min' },
        { title: 'Styles d\'écriture', type: 'text', duration: '30min' }
      ],
      exercises: [
        { title: 'Exercices de rédaction', type: 'qcm', difficulty: 'moyen', duration: '40min' },
        { title: 'Production écrite', type: 'qcm', difficulty: 'difficile', duration: '35min' }
      ]
    },
    {
      title: 'Révision et évaluation',
      description: 'Consolider les acquis et évaluer les compétences',
      duration: '2h 25min',
      lessons: [
        { title: 'Synthèse du programme', type: 'video', duration: '30min' },
        { title: 'Points essentiels', type: 'text', duration: '20min' },
        { title: 'Méthodologie d\'examen', type: 'video', duration: '25min' },
        { title: 'Épreuve finale', type: 'quiz', duration: '50min' }
      ],
      exercises: [
        { title: 'Examen complet', type: 'qcm', difficulty: 'difficile', duration: '50min' }
      ]
    }
  ],
  'Histoire-Géographie': [
    {
      title: 'Repères chronologiques et spatiaux',
      description: 'Situer les événements dans le temps et l\'espace',
      duration: '2h 40min',
      lessons: [
        { title: 'Grands repères historiques', type: 'video', duration: '30min' },
        { title: 'Cartes et territoires', type: 'video', duration: '30min' },
        { title: 'Méthodes de cartographie', type: 'text', duration: '25min' },
        { title: 'Quiz de repérage', type: 'quiz', duration: '25min' }
      ],
      exercises: [
        { title: 'Exercices de chronologie', type: 'qcm', difficulty: 'facile', duration: '20min' },
        { title: 'Exercices de cartographie', type: 'qcm', difficulty: 'moyen', duration: '30min' }
      ]
    },
    {
      title: 'Étude de documents',
      description: 'Analyser et critiquer les sources historiques',
      duration: '3h 05min',
      lessons: [
        { title: 'Types de documents', type: 'video', duration: '25min' },
        { title: 'Méthode de critique', type: 'video', duration: '35min' },
        { title: 'Analyse de sources', type: 'video', duration: '40min' },
        { title: 'Exercices d\'analyse', type: 'quiz', duration: '30min' }
      ],
      exercises: [
        { title: 'Commentaire de documents', type: 'qcm', difficulty: 'moyen', duration: '30min' },
        { title: 'Analyse critique', type: 'qcm', difficulty: 'difficile', duration: '35min' }
      ]
    },
    {
      title: 'Thèmes et problématiques',
      description: 'Approfondir les grands thèmes du programme',
      duration: '3h 00min',
      lessons: [
        { title: 'Thème 1 : Sociétés', type: 'video', duration: '40min' },
        { title: 'Thème 2 : Territoires', type: 'video', duration: '40min' },
        { title: 'Thème 3 : Mondialisation', type: 'text', duration: '35min' }
      ],
      exercises: [
        { title: 'Exercices thématiques', type: 'qcm', difficulty: 'difficile', duration: '35min' },
        { title: 'Dissertations guidées', type: 'qcm', difficulty: 'avancé', duration: '40min' }
      ]
    },
    {
      title: 'Synthèse et préparation aux examens',
      description: 'Réviser et s\'entraîner aux épreuves',
      duration: '2h 35min',
      lessons: [
        { title: 'Révision générale', type: 'video', duration: '35min' },
        { title: 'Fiches de synthèse', type: 'text', duration: '25min' },
        { title: 'Méthodologie des épreuves', type: 'video', duration: '25min' },
        { title: 'Examen blanc', type: 'quiz', duration: '50min' }
      ],
      exercises: [
        { title: 'Épreuve complète', type: 'qcm', difficulty: 'difficile', duration: '50min' }
      ]
    }
  ],
  'Anglais': [
    {
      title: 'Grammar Basics',
      description: 'Master fundamental English grammar rules',
      duration: '2h 50min',
      lessons: [
        { title: 'Tenses overview', type: 'video', duration: '30min' },
        { title: 'Articles and prepositions', type: 'video', duration: '30min' },
        { title: 'Common mistakes', type: 'text', duration: '25min' },
        { title: 'Grammar quiz', type: 'quiz', duration: '25min' }
      ],
      exercises: [
        { title: 'Grammar exercises', type: 'qcm', difficulty: 'facile', duration: '20min' },
        { title: 'Advanced structures', type: 'qcm', difficulty: 'moyen', duration: '30min' }
      ]
    },
    {
      title: 'Reading Comprehension',
      description: 'Develop reading and understanding skills',
      duration: '3h 00min',
      lessons: [
        { title: 'Reading strategies', type: 'video', duration: '25min' },
        { title: 'Text analysis', type: 'video', duration: '40min' },
        { title: 'Vocabulary building', type: 'text', duration: '35min' },
        { title: 'Comprehension test', type: 'quiz', duration: '30min' }
      ],
      exercises: [
        { title: 'Reading exercises', type: 'qcm', difficulty: 'moyen', duration: '30min' },
        { title: 'Advanced texts', type: 'qcm', difficulty: 'difficile', duration: '35min' }
      ]
    },
    {
      title: 'Speaking and Listening',
      description: 'Improve oral communication skills',
      duration: '2h 45min',
      lessons: [
        { title: 'Pronunciation guide', type: 'video', duration: '30min' },
        { title: 'Listening practice', type: 'video', duration: '35min' },
        { title: 'Conversation patterns', type: 'text', duration: '30min' }
      ],
      exercises: [
        { title: 'Listening exercises', type: 'qcm', difficulty: 'moyen', duration: '35min' },
        { title: 'Speaking practice', type: 'qcm', difficulty: 'difficile', duration: '35min' }
      ]
    },
    {
      title: 'Final Assessment',
      description: 'Comprehensive evaluation',
      duration: '2h 30min',
      lessons: [
        { title: 'Course summary', type: 'video', duration: '30min' },
        { title: 'Key points review', type: 'text', duration: '20min' },
        { title: 'Exam preparation', type: 'video', duration: '25min' },
        { title: 'Final exam', type: 'quiz', duration: '45min' }
      ],
      exercises: [
        { title: 'Comprehensive test', type: 'qcm', difficulty: 'difficile', duration: '45min' }
      ]
    }
  ]
};

// Templates par défaut pour les matières non listées
const DEFAULT_CHAPTERS = [
  {
    title: 'Introduction générale',
    description: 'Découvrir les bases et concepts fondamentaux',
    duration: '2h 30min',
    lessons: [
      { title: 'Présentation du cours', type: 'video', duration: '20min' },
      { title: 'Concepts de base', type: 'video', duration: '30min' },
      { title: 'Documentation', type: 'text', duration: '25min' },
      { title: 'Quiz d\'introduction', type: 'quiz', duration: '25min' }
    ],
    exercises: [
      { title: 'Exercices de base', type: 'qcm', difficulty: 'facile', duration: '20min' },
      { title: 'Exercices intermédiaires', type: 'qcm', difficulty: 'moyen', duration: '30min' }
    ]
  },
  {
    title: 'Développement des compétences',
    description: 'Approfondir et pratiquer',
    duration: '3h 00min',
    lessons: [
      { title: 'Techniques essentielles', type: 'video', duration: '35min' },
      { title: 'Applications pratiques', type: 'video', duration: '40min' },
      { title: 'Études de cas', type: 'text', duration: '35min' },
      { title: 'Évaluation intermédiaire', type: 'quiz', duration: '30min' }
    ],
    exercises: [
      { title: 'Exercices pratiques', type: 'qcm', difficulty: 'moyen', duration: '25min' },
      { title: 'Problèmes complexes', type: 'qcm', difficulty: 'difficile', duration: '35min' }
    ]
  },
  {
    title: 'Maîtrise avancée',
    description: 'Perfectionner ses connaissances',
    duration: '2h 45min',
    lessons: [
      { title: 'Techniques avancées', type: 'video', duration: '35min' },
      { title: 'Cas complexes', type: 'video', duration: '35min' },
      { title: 'Ressources complémentaires', type: 'text', duration: '30min' }
    ],
    exercises: [
      { title: 'Défis avancés', type: 'qcm', difficulty: 'difficile', duration: '40min' },
      { title: 'Projets pratiques', type: 'qcm', difficulty: 'avancé', duration: '35min' }
    ]
  },
  {
    title: 'Révision et évaluation finale',
    description: 'Consolider et évaluer les acquis',
    duration: '2h 20min',
    lessons: [
      { title: 'Synthèse générale', type: 'video', duration: '30min' },
      { title: 'Points clés', type: 'text', duration: '20min' },
      { title: 'Conseils pour l\'examen', type: 'video', duration: '20min' },
      { title: 'Évaluation finale', type: 'quiz', duration: '50min' }
    ],
    exercises: [
      { title: 'Examen final', type: 'qcm', difficulty: 'difficile', duration: '50min' }
    ]
  }
];

/**
 * Créer des questions QCM pour un exercice
 */
function generateQuestions(exerciseTitle, difficulty, subject) {
  const numberOfQuestions = difficulty === 'facile' ? 5 : difficulty === 'moyen' ? 8 : 10;
  const questions = [];
  
  for (let i = 1; i <= numberOfQuestions; i++) {
    questions.push({
      id: `q${i}`,
      question: `Question ${i} : ${exerciseTitle}`,
      options: [
        'Option A',
        'Option B',
        'Option C',
        'Option D'
      ],
      correctAnswer: 'Option A'
    });
  }
  
  return questions;
}

/**
 * Créer les leçons d'un chapitre
 */
async function createLessons(courseId, chapterId, lessons, chapterTitle, courseSubject) {
  const lessonIds = [];
  
  for (let i = 0; i < lessons.length; i++) {
    const lesson = lessons[i];
    const lessonData = {
      courseId,
      chapterId,
      title: lesson.title,
      type: lesson.type,
      duration: lesson.duration,
      order: i + 1,
      // Placeholder pour les URLs de vidéos/documents - à remplir plus tard
      videoUrl: lesson.type === 'video' ? `https://storage.example.com/courses/${courseId}/chapters/${chapterId}/lesson${i + 1}.mp4` : undefined,
      content: lesson.type === 'text' ? `Contenu textuel pour : ${lesson.title}` : undefined
    };
    
    const lessonRef = await db.collection('lessons').add(lessonData);
    lessonIds.push(lessonRef.id);
    
    console.log(`    ✓ Leçon créée: ${lesson.title} (${lesson.type})`);
  }
  
  return lessonIds;
}

/**
 * Créer les exercices d'un chapitre
 */
async function createExercises(courseId, chapterId, exercises, chapterTitle, courseSubject) {
  const exerciseIds = [];
  
  for (const exercise of exercises) {
    const questions = generateQuestions(exercise.title, exercise.difficulty, courseSubject);
    
    const exerciseData = {
      courseId,
      chapterId,
      title: exercise.title,
      type: exercise.type,
      difficulty: exercise.difficulty,
      duration: exercise.duration,
      instructions: `Instructions pour l'exercice : ${exercise.title}`,
      questions: exercise.type === 'qcm' ? questions : [],
      // Placeholder pour les documents PDF - à remplir plus tard
      documents: [
        {
          name: `${exercise.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
          url: `https://storage.example.com/courses/${courseId}/chapters/${chapterId}/exercises/${exercise.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
          uploadedAt: new Date()
        }
      ]
    };
    
    const exerciseRef = await db.collection('exercises').add(exerciseData);
    exerciseIds.push(exerciseRef.id);
    
    console.log(`    ✓ Exercice créé: ${exercise.title} (${exercise.difficulty})`);
  }
  
  return exerciseIds;
}

/**
 * Créer un chapitre avec ses leçons et exercices
 */
async function createChapter(course, chapterData, order) {
  const chapterInfo = {
    courseId: course.id,
    title: chapterData.title,
    description: chapterData.description,
    duration: chapterData.duration,
    order: order,
    lessonsIds: [],
    exercisesIds: []
  };
  
  // Créer le chapitre
  const chapterRef = await db.collection('chapters').add(chapterInfo);
  const chapterId = chapterRef.id;
  
  console.log(`  📚 Chapitre créé: ${chapterData.title}`);
  
  // Créer les leçons
  if (chapterData.lessons && chapterData.lessons.length > 0) {
    const lessonIds = await createLessons(
      course.id, 
      chapterId, 
      chapterData.lessons,
      chapterData.title,
      course.title
    );
    chapterInfo.lessonsIds = lessonIds;
  }
  
  // Créer les exercices
  if (chapterData.exercises && chapterData.exercises.length > 0) {
    const exerciseIds = await createExercises(
      course.id,
      chapterId,
      chapterData.exercises,
      chapterData.title,
      course.title
    );
    chapterInfo.exercisesIds = exerciseIds;
  }
  
  // Mettre à jour le chapitre avec les IDs des leçons et exercices
  await chapterRef.update({
    lessonsIds: chapterInfo.lessonsIds,
    exercisesIds: chapterInfo.exercisesIds
  });
  
  return chapterId;
}

/**
 * Trouver le template de chapitres approprié pour un cours
 */
function getChapterTemplate(course) {
  // Essayer de trouver un template basé sur le titre du cours ou la catégorie
  for (const [subject, template] of Object.entries(CHAPTER_TEMPLATES)) {
    if (course.title.includes(subject) || course.category?.includes(subject)) {
      return template;
    }
  }
  
  // Si aucun template spécifique n'est trouvé, utiliser le template par défaut
  return DEFAULT_CHAPTERS;
}

/**
 * Traiter un cours et créer ses chapitres
 */
async function processCourse(course) {
  console.log(`\n🎓 Traitement du cours: ${course.title}`);
  console.log(`   Niveau: ${course.niveauScolaire} | Classe: ${course.classe || 'N/A'}`);
  
  // Vérifier si le cours a déjà des chapitres
  if (course.chaptersIds && course.chaptersIds.length > 0) {
    console.log(`   ⚠️  Ce cours a déjà ${course.chaptersIds.length} chapitres. Passage au suivant.`);
    return;
  }
  
  // Obtenir le template de chapitres approprié
  const chapterTemplate = getChapterTemplate(course);
  const chapterIds = [];
  
  // Créer chaque chapitre
  for (let i = 0; i < chapterTemplate.length; i++) {
    const chapterId = await createChapter(course, chapterTemplate[i], i + 1);
    chapterIds.push(chapterId);
  }
  
  // Mettre à jour le cours avec les IDs des chapitres
  await db.collection('courses').doc(course.id).update({
    chaptersIds: chapterIds,
    updatedAt: new Date()
  });
  
  console.log(`  ✅ Cours mis à jour avec ${chapterIds.length} chapitres`);
}

/**
 * Fonction principale
 */
async function initChapters() {
  console.log('🚀 Initialisation des chapitres pour tous les cours\n');
  console.log('=' .repeat(60));
  
  try {
    // Récupérer tous les cours
    const coursesSnapshot = await db.collection('courses').get();
    
    if (coursesSnapshot.empty) {
      console.log('❌ Aucun cours trouvé dans la base de données');
      return;
    }
    
    console.log(`📊 ${coursesSnapshot.size} cours trouvés\n`);
    
    // Traiter chaque cours
    let processed = 0;
    let skipped = 0;
    
    for (const doc of coursesSnapshot.docs) {
      const course = { id: doc.id, ...doc.data() };
      
      if (course.chaptersIds && course.chaptersIds.length > 0) {
        skipped++;
      } else {
        await processCourse(course);
        processed++;
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Initialisation terminée !');
    console.log(`   📝 Cours traités: ${processed}`);
    console.log(`   ⏭️  Cours ignorés: ${skipped}`);
    console.log(`   📚 Total: ${coursesSnapshot.size}`);
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    throw error;
  }
}

// Fonction pour afficher les statistiques
async function showStats() {
  console.log('\n📊 Statistiques de la base de données:');
  console.log('=' .repeat(60));
  
  try {
    const coursesCount = (await db.collection('courses').get()).size;
    const chaptersCount = (await db.collection('chapters').get()).size;
    const lessonsCount = (await db.collection('lessons').get()).size;
    const exercisesCount = (await db.collection('exercises').get()).size;
    
    console.log(`   Cours: ${coursesCount}`);
    console.log(`   Chapitres: ${chaptersCount}`);
    console.log(`   Leçons: ${lessonsCount}`);
    console.log(`   Exercices: ${exercisesCount}`);
    console.log('=' .repeat(60));
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
  }
}

// Exécution
console.log('\n' + '='.repeat(60));
console.log('📚 SCRIPT D\'INITIALISATION DES CHAPITRES');
console.log('=' .repeat(60));

showStats()
  .then(() => initChapters())
  .then(() => showStats())
  .then(() => {
    console.log('\n✨ Script terminé avec succès!');
    console.log('💡 Les placeholders pour les vidéos et PDF ont été créés');
    console.log('📎 Vous pouvez maintenant ajouter les vrais liens dans Firestore');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erreur fatale:', error);
    process.exit(1);
  });
