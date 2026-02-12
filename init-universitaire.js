/**
 * Script d'initialisation pour les classes universitaires
 * Crée les matières, cours et chapitres pour Licence 1 à Master 2
 * 
 * Usage: node init-universitaire.js
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

// Classes universitaires
const CLASSES_UNIVERSITAIRES = ['Licence 1', 'Licence 2', 'Licence 3', 'Master 1', 'Master 2'];

// Matières par classe universitaire avec progression
const MATIERES_UNIVERSITAIRE = {
  'Licence 1': [
    { nom: 'Mathématiques', icone: '🔢', description: 'Algèbre et analyse de base' },
    { nom: 'Informatique', icone: '💻', description: 'Introduction à la programmation' },
    { nom: 'Physique', icone: '⚛️', description: 'Mécanique et thermodynamique' },
    { nom: 'Chimie', icone: '🧪', description: 'Chimie générale et organique' },
    { nom: 'Économie', icone: '📈', description: 'Introduction à l\'économie' },
    { nom: 'Anglais', icone: '🇬🇧', description: 'Anglais académique niveau 1' },
    { nom: 'Droit', icone: '⚖️', description: 'Introduction au droit' },
    { nom: 'Méthodologie', icone: '📝', description: 'Méthodologie universitaire' }
  ],
  'Licence 2': [
    { nom: 'Mathématiques', icone: '🔢', description: 'Algèbre linéaire et calcul différentiel' },
    { nom: 'Informatique', icone: '💻', description: 'Programmation orientée objet' },
    { nom: 'Physique', icone: '⚛️', description: 'Électromagnétisme et optique' },
    { nom: 'Chimie', icone: '🧪', description: 'Chimie analytique et physique' },
    { nom: 'Économie', icone: '📈', description: 'Microéconomie et macroéconomie' },
    { nom: 'Statistiques', icone: '📊', description: 'Probabilités et statistiques' },
    { nom: 'Anglais', icone: '🇬🇧', description: 'Anglais technique et scientifique' },
    { nom: 'Gestion', icone: '💼', description: 'Introduction à la gestion' }
  ],
  'Licence 3': [
    { nom: 'Mathématiques', icone: '🔢', description: 'Analyse complexe et équations différentielles' },
    { nom: 'Informatique', icone: '💻', description: 'Bases de données et réseaux' },
    { nom: 'Physique', icone: '⚛️', description: 'Physique quantique et relativité' },
    { nom: 'Chimie', icone: '🧪', description: 'Chimie des matériaux' },
    { nom: 'Économie', icone: '📈', description: 'Économie internationale' },
    { nom: 'Finance', icone: '💰', description: 'Mathématiques financières' },
    { nom: 'Droit des affaires', icone: '⚖️', description: 'Droit commercial et des sociétés' },
    { nom: 'Management', icone: '👥', description: 'Fondements du management' }
  ],
  'Master 1': [
    { nom: 'Recherche opérationnelle', icone: '🎯', description: 'Optimisation et modélisation' },
    { nom: 'Intelligence artificielle', icone: '🤖', description: 'Machine learning et deep learning' },
    { nom: 'Big Data', icone: '📊', description: 'Analyse de données massives' },
    { nom: 'Cybersécurité', icone: '🔐', description: 'Sécurité des systèmes d\'information' },
    { nom: 'Finance d\'entreprise', icone: '💰', description: 'Gestion financière avancée' },
    { nom: 'Marketing digital', icone: '📱', description: 'Stratégies marketing numériques' },
    { nom: 'Ressources humaines', icone: '👥', description: 'Gestion des ressources humaines' },
    { nom: 'Méthodologie de recherche', icone: '🔬', description: 'Méthodes de recherche scientifique' }
  ],
  'Master 2': [
    { nom: 'Data Science', icone: '📊', description: 'Science des données avancée' },
    { nom: 'Cloud Computing', icone: '☁️', description: 'Architecture cloud et DevOps' },
    { nom: 'Blockchain', icone: '🔗', description: 'Technologies blockchain et crypto' },
    { nom: 'Stratégie d\'entreprise', icone: '🎯', description: 'Stratégie et gouvernance' },
    { nom: 'Entrepreneuriat', icone: '🚀', description: 'Création et gestion de startup' },
    { nom: 'Droit numérique', icone: '⚖️', description: 'Droit du numérique et RGPD' },
    { nom: 'Innovation', icone: '💡', description: 'Management de l\'innovation' },
    { nom: 'Mémoire', icone: '📖', description: 'Projet de fin d\'études' }
  ]
};

// Templates de cours par matière universitaire
const COURS_TEMPLATES = {
  // Mathématiques
  'Mathématiques': {
    'Licence 1': [
      { title: 'Algèbre fondamentale', category: 'Algèbre', description: 'Ensembles, relations, structures algébriques de base' },
      { title: 'Analyse réelle', category: 'Analyse', description: 'Suites, limites, continuité, dérivation' }
    ],
    'Licence 2': [
      { title: 'Algèbre linéaire', category: 'Algèbre', description: 'Espaces vectoriels, matrices, applications linéaires' },
      { title: 'Calcul différentiel', category: 'Analyse', description: 'Dérivées partielles, gradient, extremums' }
    ],
    'Licence 3': [
      { title: 'Analyse complexe', category: 'Analyse', description: 'Fonctions holomorphes, intégrales de contour' },
      { title: 'Équations différentielles', category: 'Analyse', description: 'EDO et EDP, méthodes de résolution' }
    ]
  },
  
  // Informatique
  'Informatique': {
    'Licence 1': [
      { title: 'Algorithmique et programmation', category: 'Programmation', description: 'Initiation aux algorithmes et Python' },
      { title: 'Architecture des ordinateurs', category: 'Systèmes', description: 'Composants matériels et logiciels' }
    ],
    'Licence 2': [
      { title: 'Programmation orientée objet', category: 'Programmation', description: 'POO avec Java/Python' },
      { title: 'Structures de données', category: 'Algorithmique', description: 'Listes, arbres, graphes, complexité' }
    ],
    'Licence 3': [
      { title: 'Bases de données', category: 'Data', description: 'SQL, modélisation, optimisation' },
      { title: 'Réseaux informatiques', category: 'Réseaux', description: 'Protocoles TCP/IP, architecture réseau' },
      { title: 'Développement web', category: 'Web', description: 'HTML, CSS, JavaScript, frameworks' }
    ]
  },

  // Intelligence artificielle
  'Intelligence artificielle': {
    'Master 1': [
      { title: 'Machine Learning', category: 'IA', description: 'Apprentissage supervisé et non supervisé' },
      { title: 'Deep Learning', category: 'IA', description: 'Réseaux de neurones et CNN/RNN' }
    ]
  },

  // Big Data
  'Big Data': {
    'Master 1': [
      { title: 'Hadoop et Spark', category: 'Big Data', description: 'Traitement distribué de données' },
      { title: 'NoSQL', category: 'Bases de données', description: 'MongoDB, Cassandra, Redis' }
    ]
  },

  // Data Science
  'Data Science': {
    'Master 2': [
      { title: 'Analyse prédictive', category: 'Data Science', description: 'Modèles de prédiction avancés' },
      { title: 'Visualisation de données', category: 'Data Viz', description: 'Tableau, Power BI, D3.js' }
    ]
  },

  // Cloud Computing
  'Cloud Computing': {
    'Master 2': [
      { title: 'AWS Fondamentaux', category: 'Cloud', description: 'Services AWS essentiels' },
      { title: 'DevOps et CI/CD', category: 'DevOps', description: 'Docker, Kubernetes, Jenkins' }
    ]
  },

  // Physique
  'Physique': {
    'Licence 1': [
      { title: 'Mécanique du point', category: 'Mécanique', description: 'Cinématique et dynamique' },
      { title: 'Thermodynamique', category: 'Thermodynamique', description: 'Premier et second principes' }
    ],
    'Licence 2': [
      { title: 'Électromagnétisme', category: 'Électromagnétisme', description: 'Équations de Maxwell' },
      { title: 'Optique géométrique', category: 'Optique', description: 'Lois de réflexion et réfraction' }
    ],
    'Licence 3': [
      { title: 'Mécanique quantique', category: 'Quantique', description: 'Équation de Schrödinger' },
      { title: 'Physique statistique', category: 'Statistique', description: 'Ensembles statistiques' }
    ]
  },

  // Chimie
  'Chimie': {
    'Licence 1': [
      { title: 'Chimie générale', category: 'Chimie', description: 'Atomes, molécules, liaisons' },
      { title: 'Chimie organique I', category: 'Organique', description: 'Hydrocarbures et fonctions' }
    ],
    'Licence 2': [
      { title: 'Chimie analytique', category: 'Analytique', description: 'Méthodes d\'analyse quantitative' },
      { title: 'Chimie physique', category: 'Physique', description: 'Thermochimie et cinétique' }
    ],
    'Licence 3': [
      { title: 'Chimie des matériaux', category: 'Matériaux', description: 'Polymères et nanomatériaux' },
      { title: 'Chimie verte', category: 'Environnement', description: 'Chimie durable et éco-conception' }
    ]
  },

  // Économie
  'Économie': {
    'Licence 1': [
      { title: 'Introduction à l\'économie', category: 'Fondamentaux', description: 'Concepts économiques de base' },
      { title: 'Histoire économique', category: 'Histoire', description: 'Évolution des systèmes économiques' }
    ],
    'Licence 2': [
      { title: 'Microéconomie', category: 'Microéconomie', description: 'Théorie du consommateur et du producteur' },
      { title: 'Macroéconomie', category: 'Macroéconomie', description: 'PIB, inflation, croissance' }
    ],
    'Licence 3': [
      { title: 'Économie internationale', category: 'International', description: 'Commerce et finance internationale' },
      { title: 'Économie monétaire', category: 'Monétaire', description: 'Politique monétaire et banques centrales' }
    ]
  },

  // Finance
  'Finance': {
    'Licence 3': [
      { title: 'Mathématiques financières', category: 'Finance', description: 'Calculs financiers et actuariels' },
      { title: 'Marchés financiers', category: 'Marchés', description: 'Bourse, actions, obligations' }
    ]
  },

  'Finance d\'entreprise': {
    'Master 1': [
      { title: 'Analyse financière', category: 'Finance', description: 'États financiers et ratios' },
      { title: 'Gestion de trésorerie', category: 'Trésorerie', description: 'Budget et prévisions de trésorerie' }
    ]
  },

  // Statistiques
  'Statistiques': {
    'Licence 2': [
      { title: 'Probabilités', category: 'Probabilités', description: 'Lois de probabilité et variables aléatoires' },
      { title: 'Statistique descriptive', category: 'Statistiques', description: 'Mesures de tendance et dispersion' }
    ]
  },

  // Gestion
  'Gestion': {
    'Licence 2': [
      { title: 'Comptabilité générale', category: 'Comptabilité', description: 'Principes comptables et bilan' },
      { title: 'Gestion des organisations', category: 'Organisation', description: 'Structures et processus' }
    ]
  },

  // Management
  'Management': {
    'Licence 3': [
      { title: 'Fondements du management', category: 'Management', description: 'Théories et pratiques managériales' },
      { title: 'Leadership', category: 'Leadership', description: 'Styles de leadership et motivation' }
    ]
  },

  // Droit
  'Droit': {
    'Licence 1': [
      { title: 'Introduction au droit', category: 'Fondamentaux', description: 'Sources et branches du droit' },
      { title: 'Droit constitutionnel', category: 'Public', description: 'Organisation de l\'État' }
    ]
  },

  'Droit des affaires': {
    'Licence 3': [
      { title: 'Droit commercial', category: 'Commercial', description: 'Actes de commerce et commerçants' },
      { title: 'Droit des sociétés', category: 'Sociétés', description: 'Formes juridiques et gouvernance' }
    ]
  },

  'Droit numérique': {
    'Master 2': [
      { title: 'RGPD et protection des données', category: 'données', description: 'Réglementation européenne' },
      { title: 'Propriété intellectuelle', category: 'PI', description: 'Brevets, marques, droits d\'auteur' }
    ]
  },

  // Anglais
  'Anglais': {
    'Licence 1': [
      { title: 'Anglais académique I', category: 'Langue', description: 'Compréhension et expression écrite' }
    ],
    'Licence 2': [
      { title: 'Anglais technique', category: 'Technique', description: 'Vocabulaire scientifique et technique' }
    ]
  },

  // Cybersécurité
  'Cybersécurité': {
    'Master 1': [
      { title: 'Sécurité des réseaux', category: 'Réseaux', description: 'Firewalls, VPN, IDS/IPS' },
      { title: 'Cryptographie', category: 'Crypto', description: 'Chiffrement et signatures numériques' }
    ]
  },

  // Marketing digital
  'Marketing digital': {
    'Master 1': [
      { title: 'SEO et SEA', category: 'Marketing', description: 'Référencement naturel et payant' },
      { title: 'Social Media Marketing', category: 'Social', description: 'Stratégies sur réseaux sociaux' }
    ]
  },

  // Ressources humaines
  'Ressources humaines': {
    'Master 1': [
      { title: 'Gestion des talents', category: 'RH', description: 'Recrutement et développement' },
      { title: 'Droit du travail', category: 'Droit', description: 'Contrats et relations sociales' }
    ]
  },

  // Méthodologie
  'Méthodologie': {
    'Licence 1': [
      { title: 'Méthodologie du travail universitaire', category: 'Méthodologie', description: 'Recherche, rédaction, présentation' }
    ]
  },

  'Méthodologie de recherche': {
    'Master 1': [
      { title: 'Méthodes de recherche', category: 'Recherche', description: 'Méthodes qualitatives et quantitatives' },
      { title: 'Rédaction scientifique', category: 'Rédaction', description: 'Articles et mémoires' }
    ]
  },

  // Recherche opérationnelle
  'Recherche opérationnelle': {
    'Master 1': [
      { title: 'Optimisation linéaire', category: 'Optimisation', description: 'Programmation linéaire et simplex' },
      { title: 'Théorie des graphes', category: 'Graphes', description: 'Algorithmes sur les graphes' }
    ]
  },

  // Blockchain
  'Blockchain': {
    'Master 2': [
      { title: 'Fondamentaux blockchain', category: 'Blockchain', description: 'Concepts et architectures' },
      { title: 'Smart contracts', category: 'Développement', description: 'Solidity et Ethereum' }
    ]
  },

  // Stratégie d'entreprise
  'Stratégie d\'entreprise': {
    'Master 2': [
      { title: 'Analyse stratégique', category: 'Stratégie', description: 'Porter, SWOT, matrices' },
      { title: 'Gouvernance d\'entreprise', category: 'Gouvernance', description: 'Conseil d\'administration et parties prenantes' }
    ]
  },

  // Entrepreneuriat
  'Entrepreneuriat': {
    'Master 2': [
      { title: 'Business plan', category: 'Création', description: 'Élaboration du plan d\'affaires' },
      { title: 'Financement startup', category: 'Finance', description: 'Levée de fonds et investisseurs' }
    ]
  },

  // Innovation
  'Innovation': {
    'Master 2': [
      { title: 'Design thinking', category: 'Innovation', description: 'Méthodologie centrée utilisateur' },
      { title: 'Gestion de projet agile', category: 'Projet', description: 'Scrum et méthodes agiles' }
    ]
  },

  // Mémoire
  'Mémoire': {
    'Master 2': [
      { title: 'Projet de fin d\'études', category: 'Mémoire', description: 'Rédaction et soutenance du mémoire' }
    ]
  }
};

// Chapitres universitaires (plus avancés)
const CHAPTERS_UNIVERSITAIRE = [
  {
    title: 'Introduction et fondements',
    description: 'Présentation du cours et concepts fondamentaux',
    duration: '3h 00min',
    lessons: [
      { title: 'Présentation du cours', type: 'video', duration: '30min' },
      { title: 'Objectifs et compétences', type: 'text', duration: '20min' },
      { title: 'Concepts fondamentaux', type: 'video', duration: '45min' },
      { title: 'Historique et évolution', type: 'video', duration: '30min' },
      { title: 'Quiz d\'introduction', type: 'quiz', duration: '25min' }
    ],
    exercises: [
      { title: 'QCM d\'évaluation initiale', type: 'qcm', difficulty: 'moyen', duration: '30min' }
    ]
  },
  {
    title: 'Théorie et principes',
    description: 'Approfondissement théorique du sujet',
    duration: '4h 30min',
    lessons: [
      { title: 'Principe 1 - Théorie', type: 'video', duration: '50min' },
      { title: 'Principe 2 - Démonstrations', type: 'video', duration: '60min' },
      { title: 'Principe 3 - Applications', type: 'video', duration: '45min' },
      { title: 'Synthèse théorique', type: 'text', duration: '30min' },
      { title: 'Quiz théorique', type: 'quiz', duration: '35min' }
    ],
    exercises: [
      { title: 'Exercices théoriques', type: 'qcm', difficulty: 'moyen', duration: '40min' },
      { title: 'Problèmes de réflexion', type: 'qcm', difficulty: 'difficile', duration: '50min' }
    ]
  },
  {
    title: 'Applications pratiques',
    description: 'Mise en pratique des connaissances',
    duration: '4h 00min',
    lessons: [
      { title: 'Cas pratique 1', type: 'video', duration: '45min' },
      { title: 'Cas pratique 2', type: 'video', duration: '45min' },
      { title: 'Étude de cas', type: 'video', duration: '60min' },
      { title: 'Travaux dirigés', type: 'text', duration: '40min' },
      { title: 'Auto-évaluation', type: 'quiz', duration: '30min' }
    ],
    exercises: [
      { title: 'TD noté', type: 'qcm', difficulty: 'moyen', duration: '45min' },
      { title: 'Projet pratique', type: 'qcm', difficulty: 'difficile', duration: '60min' }
    ]
  },
  {
    title: 'Approfondissement',
    description: 'Notions avancées et spécialisées',
    duration: '3h 30min',
    lessons: [
      { title: 'Notions avancées', type: 'video', duration: '50min' },
      { title: 'Cas complexes', type: 'video', duration: '45min' },
      { title: 'Recherche actuelle', type: 'video', duration: '35min' },
      { title: 'Documentation technique', type: 'text', duration: '30min' }
    ],
    exercises: [
      { title: 'Exercices avancés', type: 'qcm', difficulty: 'difficile', duration: '50min' }
    ]
  },
  {
    title: 'Évaluation finale',
    description: 'Bilan et validation des acquis',
    duration: '2h 30min',
    lessons: [
      { title: 'Révisions générales', type: 'video', duration: '40min' },
      { title: 'Points clés à retenir', type: 'text', duration: '25min' },
      { title: 'Préparation à l\'examen', type: 'video', duration: '35min' },
      { title: 'Examen blanc', type: 'quiz', duration: '50min' }
    ],
    exercises: [
      { title: 'Examen final', type: 'qcm', difficulty: 'difficile', duration: '90min' }
    ]
  }
];

// Prix des cours universitaires (en FCFA)
const PRIX_COURS = {
  'Licence 1': 2000,
  'Licence 2': 2500,
  'Licence 3': 3000,
  'Master 1': 4000,
  'Master 2': 5000
};

/**
 * Créer les matières pour une classe universitaire
 */
async function createMatieres(classe) {
  console.log(`\n📚 Création des matières pour ${classe}`);
  const matieres = MATIERES_UNIVERSITAIRE[classe];
  const matieresIds = {};
  
  for (const matiereData of matieres) {
    const existingMatiere = await db.collection('matieres')
      .where('nom', '==', matiereData.nom)
      .where('classe', '==', classe)
      .where('niveauScolaire', '==', 'UNIVERSITAIRE')
      .get();
    
    if (!existingMatiere.empty) {
      const existing = existingMatiere.docs[0];
      matieresIds[matiereData.nom] = existing.id;
      console.log(`   ⚠️  ${matiereData.nom} existe déjà`);
      continue;
    }
    
    const matiere = {
      nom: matiereData.nom,
      niveauScolaire: 'UNIVERSITAIRE',
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
 * Créer les cours pour une classe universitaire
 */
async function createCourses(classe, matieresIds) {
  console.log(`\n🎓 Création des cours pour ${classe}`);
  const coursesIds = [];
  
  for (const [matiereNom, classeTemplates] of Object.entries(COURS_TEMPLATES)) {
    if (!matieresIds[matiereNom]) continue;
    if (!classeTemplates[classe]) continue;
    
    for (const template of classeTemplates[classe]) {
      const fullTitle = `${template.title} - ${classe}`;
      
      const existingCourse = await db.collection('courses')
        .where('title', '==', fullTitle)
        .where('classe', '==', classe)
        .get();
      
      if (!existingCourse.empty) {
        coursesIds.push(existingCourse.docs[0].id);
        console.log(`   ⚠️  ${fullTitle} existe déjà`);
        continue;
      }
      
      const courseData = {
        title: fullTitle,
        description: template.description,
        niveauScolaire: 'UNIVERSITAIRE',
        matiereId: matieresIds[matiereNom],
        classe: classe,
        category: template.category,
        type: 'VIDEO',
        level: classe.includes('Master') ? 'AVANCE' : 'INTERMEDIAIRE',
        duration: classe.includes('Master') ? 180 : 150, // minutes
        sessions: classe.includes('Master') ? 15 : 12,
        price: PRIX_COURS[classe],
        rating: (Math.random() * 1.5 + 3.5).toFixed(1),
        image: getImageForSubject(matiereNom),
        isPublished: true,
        certificateAvailable: true,
        chaptersIds: [],
        chapters: [],
        exercises: 25,
        enrolledUsers: [],
        documents: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const courseRef = await db.collection('courses').add(courseData);
      coursesIds.push(courseRef.id);
      console.log(`   ✅ ${fullTitle} créé`);
    }
  }
  
  return coursesIds;
}

/**
 * Créer les chapitres pour un cours
 */
async function createChaptersForCourse(courseId, courseTitle) {
  const chaptersIds = [];
  
  for (let i = 0; i < CHAPTERS_UNIVERSITAIRE.length; i++) {
    const chapterTemplate = CHAPTERS_UNIVERSITAIRE[i];
    
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
    const questions = generateQuestionsForUniversity(exerciseTemplate.title, exerciseTemplate.difficulty);
    
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
 * Générer des questions adaptées au niveau universitaire
 */
function generateQuestionsForUniversity(title, difficulty) {
  const numQuestions = difficulty === 'facile' ? 5 : difficulty === 'moyen' ? 10 : 15;
  const questions = [];
  
  for (let i = 1; i <= numQuestions; i++) {
    questions.push({
      id: `q${i}`,
      question: `Question ${i} - ${title}`,
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
 * Obtenir l'image selon la matière
 */
function getImageForSubject(subject) {
  const images = {
    'Mathématiques': 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800',
    'Informatique': 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800',
    'Physique': 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800',
    'Chimie': 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800',
    'Économie': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
    'Statistiques': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
    'Finance': 'https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=800',
    'Finance d\'entreprise': 'https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=800',
    'Gestion': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
    'Management': 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
    'Droit': 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800',
    'Droit des affaires': 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800',
    'Droit numérique': 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800',
    'Anglais': 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800',
    'Intelligence artificielle': 'https://images.unsplash.com/photo-1677442135703-1b78c5abacaf?w=800',
    'Big Data': 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=800',
    'Data Science': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
    'Cloud Computing': 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800',
    'Cybersécurité': 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=800',
    'Marketing digital': 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=800',
    'Ressources humaines': 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800',
    'Méthodologie': 'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=800',
    'Méthodologie de recherche': 'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=800',
    'Recherche opérationnelle': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
    'Blockchain': 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800',
    'Stratégie d\'entreprise': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
    'Entrepreneuriat': 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800',
    'Innovation': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
    'Mémoire': 'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=800'
  };
  return images[subject] || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800';
}

/**
 * Traiter une classe universitaire complète
 */
async function processClasse(classe) {
  console.log(`\n🎓 === TRAITEMENT ${classe} ===`);
  
  try {
    // 1. Créer les matières
    const matieresIds = await createMatieres(classe);
    
    // 2. Créer les cours
    const coursesIds = await createCourses(classe, matieresIds);
    
    // 3. Créer les chapitres pour chaque nouveau cours
    console.log(`\n📖 Création des chapitres pour ${classe}`);
    for (const courseId of coursesIds) {
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
    
    console.log(`\n✅ ${classe} terminée !`);
    return {
      matieres: Object.keys(matieresIds).length,
      cours: coursesIds.length,
      chapitres: coursesIds.length * CHAPTERS_UNIVERSITAIRE.length
    };
    
  } catch (error) {
    console.error(`❌ Erreur pour ${classe}:`, error);
    return null;
  }
}

/**
 * Fonction principale
 */
async function initUniversitaire() {
  console.log('🚀 INITIALISATION COURS UNIVERSITAIRES');
  console.log('=' .repeat(60));
  
  const results = {};
  
  for (const classe of CLASSES_UNIVERSITAIRES) {
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
  
  console.log(`\nTOTAL UNIVERSITAIRE: ${totalMatieres} matières, ${totalCours} cours, ${totalChapitres} chapitres`);
  console.log('\n✨ Initialisation terminée !');
}

// Exécution
initUniversitaire()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Erreur fatale:', error);
    process.exit(1);
  });
