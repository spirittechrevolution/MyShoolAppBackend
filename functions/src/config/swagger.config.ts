import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MySchool API',
      version: '2.0.0',
      description: `API REST complète pour MySchool e-learning. 
        Gestion des utilisateurs, cours, chapitres, leçons, exercices, inscriptions et instructeurs.
        Support complet des requêtes filtrées et index Firestore optimisés.`,
      contact: {
        name: 'MySchool Support',
        email: 'support@myschool.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'https://us-central1-myschool-f862b.cloudfunctions.net/api',
        description: 'Serveur de production'
      },
      {
        url: 'http://localhost:5001/myschool-f862b/us-central1/api',
        description: 'Serveur de développement (Firebase Emulator)'
      },
      {
        url: 'http://localhost:3000',
        description: 'Serveur de développement local'
      }
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          required: ['firstName', 'lastName', 'phone', 'level', 'role', 'status'],
          properties: {
            uid: { type: 'string', description: 'ID Firebase Auth (auto-généré)' },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            phone: { type: 'string', example: '+221771234567' },
            login: { type: 'string', example: '+221771234567' },
            password: { type: 'string', example: 'Password123', description: 'Requis à la création uniquement' },
            level: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'], example: 'beginner' },
            role: {
              type: 'object',
              properties: {
                libelle: { type: 'string', enum: ['student', 'instructor', 'admin'], example: 'student' }
              }
            },
            status: { type: 'string', enum: ['active', 'inactive', 'suspended'], example: 'active' },
            profileImage: { type: 'string', description: 'URL de l\'image de profil' },
            specializationId: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Course: {
          type: 'object',
          required: ['title', 'description', 'level', 'expertiseId'],
          properties: {
            title: { type: 'string', example: 'Introduction à JavaScript' },
            description: { type: 'string', example: 'Apprendre les bases de JavaScript' },
            image: { type: 'string', description: 'URL de l\'image du cours' },
            level: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'], example: 'beginner' },
            duration: { type: 'number', example: 120, description: 'Durée en minutes' },
            price: { type: 'number', example: 0, description: 'Prix (0 = gratuit)' },
            expertiseId: { type: 'string', example: 'web-development' },
            instructorId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Chapter: {
          type: 'object',
          required: ['title', 'courseId', 'order'],
          properties: {
            title: { type: 'string', example: 'Chapitre 1: Variables' },
            description: { type: 'string', example: 'Introduction aux variables' },
            courseId: { type: 'string' },
            order: { type: 'number', example: 1 },
            duration: { type: 'number', example: 30 },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Lesson: {
          type: 'object',
          required: ['title', 'chapterId', 'order'],
          properties: {
            title: { type: 'string', example: 'Les variables en JavaScript' },
            content: { type: 'string', example: 'Contenu de la leçon...' },
            videoUrl: { type: 'string', example: 'https://youtube.com/watch?v=...' },
            chapterId: { type: 'string' },
            order: { type: 'number', example: 1 },
            duration: { type: 'number', example: 15 },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Exercise: {
          type: 'object',
          required: ['title', 'lessonId', 'type'],
          properties: {
            title: { type: 'string', example: 'Quiz: Les variables' },
            description: { type: 'string', example: 'Testez vos connaissances' },
            lessonId: { type: 'string' },
            type: { type: 'string', enum: ['quiz', 'coding', 'essay'], example: 'quiz' },
            questions: { type: 'array', items: { type: 'object' } },
            points: { type: 'number', example: 10 },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Enrollment: {
          type: 'object',
          required: ['userId', 'courseId'],
          properties: {
            userId: { type: 'string' },
            courseId: { type: 'string' },
            courseTitle: { type: 'string' },
            courseImage: { type: 'string' },
            enrolledAt: { type: 'string', format: 'date-time' },
            status: { type: 'string', enum: ['active', 'completed', 'cancelled'], example: 'active' },
            progress: { type: 'number', example: 0, minimum: 0, maximum: 100 },
            amount: { type: 'number', example: 0 },
            paymentMethod: { type: 'string', enum: ['free-money', 'wave', 'orange-money', 'card'], example: 'free-money' },
            chaptersCompleted: { type: 'array', items: { type: 'string' } }
          }
        },
        Instructor: {
          type: 'object',
          required: ['userId', 'bio', 'specialization'],
          properties: {
            userId: { type: 'string' },
            bio: { type: 'string', example: 'Développeur web avec 10 ans d\'expérience' },
            specialization: { type: 'string', example: 'web-development' },
            rating: { type: 'number', example: 4.5, minimum: 0, maximum: 5 },
            totalStudents: { type: 'number', example: 150 },
            totalCourses: { type: 'number', example: 5 },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Message d\'erreur' }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'object' },
            message: { type: 'string' }
          }
        }
      }
    },
    tags: [
      { name: 'Users', description: 'Gestion des utilisateurs' },
      { name: 'Courses', description: 'Gestion des cours' },
      { name: 'Chapters', description: 'Gestion des chapitres' },
      { name: 'Lessons', description: 'Gestion des leçons' },
      { name: 'Exercises', description: 'Gestion des exercices' },
      { name: 'Enrollments', description: 'Gestion des inscriptions' },
      { name: 'Instructors', description: 'Gestion des instructeurs' }
    ]
  },
  apis: [
    __dirname + '/../routes/*.ts',
    __dirname + '/../routes/*.js'
  ]
};

export const swaggerSpec = swaggerJsdoc(options);
