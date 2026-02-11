/**
 * Script d'initialisation des cours pour toutes les matières
 * Crée des cours réalistes pour chaque matière dans Firestore
 * 
 * Usage: node init-courses.js
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

// Templates de cours par matière
const COURSE_TEMPLATES = {
  'Mathématiques': [
    {
      title: 'Algèbre fondamentale',
      category: 'Algèbre',
      description: 'Maîtriser les équations et les inéquations',
      type: 'VIDEO',
      level: 'DEBUTANT',
      duration: 120,
      sessions: 12,
      exercises: 30
    },
    {
      title: 'Géométrie dans l\'espace',
      category: 'Géométrie',
      description: 'Étudier les solides et les volumes',
      type: 'En ligne',
      level: 'INTERMEDIAIRE',
      duration: 90,
      sessions: 10,
      exercises: 25
    },
    {
      title: 'Analyse mathématique',
      category: 'Analyse',
      description: 'Découvrir les fonctions et leurs propriétés',
      type: 'Hybrid',
      level: 'AVANCE',
      duration: 150,
      sessions: 15,
      exercises: 40
    }
  ],
  'Français': [
    {
      title: 'Grammaire française',
      category: 'Grammaire',
      description: 'Maîtriser les règles de grammaire essentielles',
      type: 'En ligne',
      level: 'DEBUTANT',
      duration: 100,
      sessions: 10,
      exercises: 35
    },
    {
      title: 'Littérature classique',
      category: 'Littérature',
      description: 'Étudier les grands auteurs de la littérature française',
      type: 'VIDEO',
      level: 'INTERMEDIAIRE',
      duration: 130,
      sessions: 12,
      exercises: 20
    },
    {
      title: 'Production écrite',
      category: 'Expression écrite',
      description: 'Apprendre à rédiger différents types de textes',
      type: 'Hybrid',
      level: 'INTERMEDIAIRE',
      duration: 110,
      sessions: 11,
      exercises: 28
    }
  ],
  'Anglais': [
    {
      title: 'English Grammar Basics',
      category: 'Grammar',
      description: 'Master essential English grammar rules',
      type: 'En ligne',
      level: 'DEBUTANT',
      duration: 90,
      sessions: 10,
      exercises: 32
    },
    {
      title: 'English Conversation',
      category: 'Speaking',
      description: 'Improve your spoken English skills',
      type: 'VIDEO',
      level: 'INTERMEDIAIRE',
      duration: 100,
      sessions: 12,
      exercises: 15
    },
    {
      title: 'Business English',
      category: 'Professional',
      description: 'English for business and professional contexts',
      type: 'Hybrid',
      level: 'AVANCE',
      duration: 120,
      sessions: 14,
      exercises: 25
    }
  ],
  'SVT': [
    {
      title: 'Biologie cellulaire',
      category: 'Biologie',
      description: 'Découvrir la structure et le fonctionnement des cellules',
      type: 'VIDEO',
      level: 'DEBUTANT',
      duration: 95,
      sessions: 10,
      exercises: 22
    },
    {
      title: 'Écologie et environnement',
      category: 'Écologie',
      description: 'Comprendre les écosystèmes et la biodiversité',
      type: 'En ligne',
      level: 'INTERMEDIAIRE',
      duration: 110,
      sessions: 11,
      exercises: 26
    },
    {
      title: 'Génétique et hérédité',
      category: 'Génétique',
      description: 'Étudier les mécanismes de transmission des caractères',
      type: 'Hybrid',
      level: 'AVANCE',
      duration: 140,
      sessions: 13,
      exercises: 30
    }
  ],
  'Physique-Chimie': [
    {
      title: 'Mécanique classique',
      category: 'Physique',
      description: 'Les lois du mouvement et de la dynamique',
      type: 'VIDEO',
      level: 'INTERMEDIAIRE',
      duration: 125,
      sessions: 12,
      exercises: 35
    },
    {
      title: 'Chimie organique',
      category: 'Chimie',
      description: 'Introduction aux composés organiques',
      type: 'En ligne',
      level: 'INTERMEDIAIRE',
      duration: 115,
      sessions: 11,
      exercises: 28
    },
    {
      title: 'Électricité et magnétisme',
      category: 'Physique',
      description: 'Les phénomènes électromagnétiques',
      type: 'Hybrid',
      level: 'AVANCE',
      duration: 135,
      sessions: 13,
      exercises: 32
    }
  ],
  'Histoire-Géographie': [
    {
      title: 'Histoire du Sénégal',
      category: 'Histoire',
      description: 'De la préhistoire à l\'indépendance',
      type: 'VIDEO',
      level: 'DEBUTANT',
      duration: 100,
      sessions: 10,
      exercises: 20
    },
    {
      title: 'Géographie de l\'Afrique',
      category: 'Géographie',
      description: 'Relief, climat et ressources du continent africain',
      type: 'En ligne',
      level: 'INTERMEDIAIRE',
      duration: 90,
      sessions: 9,
      exercises: 18
    },
    {
      title: 'Histoire contemporaine',
      category: 'Histoire',
      description: 'Le monde depuis 1945',
      type: 'Hybrid',
      level: 'AVANCE',
      duration: 130,
      sessions: 12,
      exercises: 25
    }
  ],
  'Physique': [
    {
      title: 'Thermodynamique',
      category: 'Thermodynamique',
      description: 'Les principes de la thermodynamique',
      type: 'VIDEO',
      level: 'AVANCE',
      duration: 140,
      sessions: 14,
      exercises: 35
    },
    {
      title: 'Optique géométrique',
      category: 'Optique',
      description: 'Lentilles, miroirs et instruments optiques',
      type: 'En ligne',
      level: 'INTERMEDIAIRE',
      duration: 105,
      sessions: 10,
      exercises: 28
    }
  ],
  'Chimie': [
    {
      title: 'Chimie générale',
      category: 'Chimie générale',
      description: 'Les bases de la chimie',
      type: 'VIDEO',
      level: 'DEBUTANT',
      duration: 110,
      sessions: 11,
      exercises: 30
    },
    {
      title: 'Chimie analytique',
      category: 'Analyse',
      description: 'Méthodes d\'analyse chimique',
      type: 'Hybrid',
      level: 'AVANCE',
      duration: 130,
      sessions: 13,
      exercises: 32
    }
  ],
  'Sciences': [
    {
      title: 'Sciences de la vie',
      category: 'Biologie',
      description: 'Introduction aux sciences du vivant',
      type: 'VIDEO',
      level: 'DEBUTANT',
      duration: 80,
      sessions: 8,
      exercises: 20
    },
    {
      title: 'Sciences de la Terre',
      category: 'Géologie',
      description: 'Notre planète et ses phénomènes',
      type: 'En ligne',
      level: 'DEBUTANT',
      duration: 85,
      sessions: 9,
      exercises: 22
    }
  ],
  'Philosophie': [
    {
      title: 'Introduction à la philosophie',
      category: 'Méthodologie',
      description: 'Les grands concepts philosophiques',
      type: 'VIDEO',
      level: 'DEBUTANT',
      duration: 95,
      sessions: 10,
      exercises: 15
    },
    {
      title: 'Éthique et morale',
      category: 'Morale',
      description: 'Les théories éthiques fondamentales',
      type: 'En ligne',
      level: 'INTERMEDIAIRE',
      duration: 105,
      sessions: 11,
      exercises: 18
    },
    {
      title: 'Philosophie politique',
      category: 'Politique',
      description: 'Les grandes doctrines politiques',
      type: 'Hybrid',
      level: 'AVANCE',
      duration: 120,
      sessions: 12,
      exercises: 20
    }
  ],
  'Algorithmique': [
    {
      title: 'Introduction aux algorithmes',
      category: 'Algorithmique',
      description: 'Les bases de l\'algorithmique et de la complexité',
      type: 'VIDEO',
      level: 'DEBUTANT',
      duration: 120,
      sessions: 12,
      exercises: 40
    },
    {
      title: 'Structures de données',
      category: 'Structures',
      description: 'Listes, arbres, graphes et tables de hachage',
      type: 'En ligne',
      level: 'INTERMEDIAIRE',
      duration: 135,
      sessions: 14,
      exercises: 45
    }
  ],
  'Base de données': [
    {
      title: 'SQL fondamentaux',
      category: 'SQL',
      description: 'Maîtriser le langage SQL',
      type: 'VIDEO',
      level: 'DEBUTANT',
      duration: 110,
      sessions: 11,
      exercises: 35
    },
    {
      title: 'Conception de bases de données',
      category: 'Modélisation',
      description: 'Modèles relationnels et normalisation',
      type: 'Hybrid',
      level: 'INTERMEDIAIRE',
      duration: 125,
      sessions: 13,
      exercises: 30
    }
  ],
  'Réseaux': [
    {
      title: 'Introduction aux réseaux',
      category: 'Réseaux',
      description: 'Les fondamentaux des réseaux informatiques',
      type: 'VIDEO',
      level: 'DEBUTANT',
      duration: 100,
      sessions: 10,
      exercises: 28
    },
    {
      title: 'Protocoles TCP/IP',
      category: 'Protocoles',
      description: 'Architecture et protocoles Internet',
      type: 'En ligne',
      level: 'INTERMEDIAIRE',
      duration: 120,
      sessions: 12,
      exercises: 32
    }
  ],
  'Programmation': [
    {
      title: 'Python pour débutants',
      category: 'Python',
      description: 'Apprendre les bases de Python',
      type: 'VIDEO',
      level: 'DEBUTANT',
      duration: 130,
      sessions: 13,
      exercises: 50
    },
    {
      title: 'JavaScript moderne',
      category: 'JavaScript',
      description: 'ES6+ et programmation web',
      type: 'En ligne',
      level: 'INTERMEDIAIRE',
      duration: 140,
      sessions: 14,
      exercises: 55
    },
    {
      title: 'Java avancé',
      category: 'Java',
      description: 'Concepts avancés et design patterns',
      type: 'Hybrid',
      level: 'AVANCE',
      duration: 150,
      sessions: 15,
      exercises: 60
    }
  ]
};

// Images par défaut selon la matière
const IMAGES_BY_SUBJECT = {
  'Mathématiques': 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800',
  'Français': 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800',
  'Anglais': 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800',
  'SVT': 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800',
  'Physique-Chimie': 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=800',
  'Histoire-Géographie': 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800',
  'Physique': 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800',
  'Chimie': 'https://images.unsplash.com/photo-1532634922-8fe0b757fb13?w=800',
  'Sciences': 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800',
  'Philosophie': 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800',
  'Algorithmique': 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800',
  'Base de données': 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800',
  'Réseaux': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
  'Programmation': 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800'
};

// Fonction pour générer des chapitres
function generateChapters(count) {
  const chapters = [];
  for (let i = 1; i <= count; i++) {
    chapters.push({
      id: `chap_${Date.now()}_${i}`,
      title: `Chapitre ${i}`,
      duration: Math.floor(Math.random() * 30) + 10,
      ordre: i
    });
  }
  return chapters;
}

// Fonction pour générer des documents
function generateDocuments(courseTitle) {
  return [
    {
      name: `${courseTitle} - Support de cours.pdf`,
      url: `https://storage.myschool.sn/documents/${Date.now()}_support.pdf`,
      size: Math.floor(Math.random() * 3000000) + 500000,
      uploadedAt: new Date()
    },
    {
      name: `${courseTitle} - Exercices.pdf`,
      url: `https://storage.myschool.sn/documents/${Date.now()}_exercices.pdf`,
      size: Math.floor(Math.random() * 2000000) + 300000,
      uploadedAt: new Date()
    }
  ];
}

async function createCoursesForMatieres() {
  console.log('🚀 Initialisation des cours dans Firestore...\n');

  try {
    // Récupérer toutes les matières
    const matieresSnapshot = await db.collection('matieres')
      .where('isActive', '==', true)
      .get();

    if (matieresSnapshot.empty) {
      console.log('❌ Aucune matière trouvée. Veuillez d\'abord exécuter init-matieres.js');
      return;
    }

    console.log(`📚 ${matieresSnapshot.size} matières trouvées\n`);

    const batch = db.batch();
    let courseCount = 0;

    // Pour chaque matière
    for (const matiereDoc of matieresSnapshot.docs) {
      const matiere = matiereDoc.data();
      const matiereId = matiereDoc.id;
      const matiereNom = matiere.nom;

      // Vérifier si on a des templates pour cette matière
      const templates = COURSE_TEMPLATES[matiereNom];
      if (!templates) {
        console.log(`⚠️  Pas de template pour: ${matiereNom} (${matiere.classe})`);
        continue;
      }

      // Créer les cours pour cette matière
      for (const template of templates) {
        const courseRef = db.collection('courses').doc();
        
        const courseData = {
          id: courseRef.id,
          title: `${template.title} - ${matiere.classe}`,
          description: template.description,
          
          // Hiérarchie
          niveauScolaire: matiere.niveauScolaire,
          matiereId: matiereId,
          classe: matiere.classe,
          
          // Détails du cours
          category: template.category,
          type: template.type,
          level: template.level,
          duration: template.duration,
          sessions: template.sessions,
          price: 0, // Cours gratuits
          rating: (Math.random() * 2 + 3).toFixed(1), // Entre 3.0 et 5.0
          image: IMAGES_BY_SUBJECT[matiereNom] || 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800',
          isPublished: true,
          certificateAvailable: template.level !== 'DEBUTANT',
          
          // Contenu
          chaptersIds: [],
          chapters: generateChapters(Math.floor(template.sessions / 2)),
          exercises: template.exercises,
          enrolledUsers: [],
          documents: generateDocuments(template.title),
          
          // Métadonnées
          createdAt: new Date(),
          updatedAt: new Date()
        };

        batch.set(courseRef, courseData);
        courseCount++;

        console.log(`✅ ${courseCount}. ${courseData.title}`);
        console.log(`   └─ Matière: ${matiereNom} | Niveau: ${template.level} | Type: ${template.type}`);
      }
    }

    // Commit le batch
    await batch.commit();
    
    console.log('\n' + '='.repeat(60));
    console.log(`✅ ${courseCount} cours créés avec succès!`);
    console.log('='.repeat(60));

    // Statistiques par niveau
    console.log('\n📊 Statistiques des cours créés:\n');
    const coursesSnapshot = await db.collection('courses').get();
    const statsByNiveau = {};
    
    coursesSnapshot.docs.forEach(doc => {
      const cours = doc.data();
      if (!statsByNiveau[cours.niveauScolaire]) {
        statsByNiveau[cours.niveauScolaire] = 0;
      }
      statsByNiveau[cours.niveauScolaire]++;
    });

    Object.entries(statsByNiveau).forEach(([niveau, count]) => {
      console.log(`  - ${niveau}: ${count} cours`);
    });

    // Statistiques par type
    console.log('\n📊 Répartition par type:\n');
    const statsByType = {};
    coursesSnapshot.docs.forEach(doc => {
      const cours = doc.data();
      if (!statsByType[cours.type]) {
        statsByType[cours.type] = 0;
      }
      statsByType[cours.type]++;
    });

    Object.entries(statsByType).forEach(([type, count]) => {
      console.log(`  - ${type}: ${count} cours`);
    });

    console.log('\n✨ Initialisation terminée!\n');

  } catch (error) {
    console.error('❌ Erreur lors de la création des cours:', error);
    throw error;
  }
}

// Exécuter le script
createCoursesForMatieres()
  .then(() => {
    console.log('🎉 Script terminé avec succès!');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
  });
