import * as functions from 'firebase-functions';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import * as swaggerDocument from './swagger.json';
import userRoutes from './routes/user.routes';
import courseRoutes from './routes/course.routes';
import chapterRoutes from './routes/chapter.routes';
import lessonRoutes from './routes/lesson.routes';
import exerciseRoutes from './routes/exercise.routes';
import enrollmentRoutes from './routes/enrollment.routes';
import instructorRoutes from './routes/instructor.routes';
import paymentRoutes from './routes/payment.routes';
import referralRoutes from './routes/referral.routes';
import pushNotificationRoutes from './routes/push-notification.routes';
import faqRoutes from './routes/faq.routes';
import chatRoutes from './routes/chat.routes';
import waveRoutes from './routes/wave.routes';
import subscriptionRoutes from './routes/subscription.routes';

// Load environment variables (for local development)
dotenv.config();

const app = express();

// CORS Configuration - Autoriser plusieurs origins
const allowedOrigins = [
  'http://localhost:4200',
  'http://localhost:4201',
  'http://localhost:4202',
  'http://localhost:4203',
  'http://localhost:4204',
  'http://localhost:4205',
  // Domaines de production
  'https://myschool-f862b.web.app',
  'https://myschool-f862b.firebaseapp.com',
  // URLs Cloud Functions pour Swagger UI
  'https://us-central1-myschool-f862b.cloudfunctions.net',
  'https://api-xa66eyezzq-uc.a.run.app'
];

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Autoriser les requêtes sans origin (ex: Postman, curl, server-to-server)
    if (!origin) {
      callback(null, true);
      return;
    }
    
    // Vérifier si l'origin est dans la liste autorisée
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Non autorisé par CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Route racine
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'MySchool API - Firebase Cloud Functions',
    version: '1.0.0',
    documentation: {
      swagger_ui: '/api/api-docs',
      openapi_json: '/api/openapi.json',
      description: 'Interface Swagger UI interactive disponible sur /api/api-docs'
    },
    endpoints: {
      users: '/users',
      courses: '/courses',
      chapters: '/chapters',
      lessons: '/lessons',
      exercises: '/exercises',
      enrollments: '/enrollments',
      instructors: '/instructors',
      payments: '/payments',
      referrals: '/referrals',
      pushNotifications: '/push-notifications',
      faqs: '/faqs',
      chat: '/chat',
      wave: '/wave',
      subscriptions: '/subscriptions'
    }
  });
});

// Swagger UI - Interface HTML avec CDN
app.get('/api-docs', (req, res) => {
  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MySchool API - Documentation</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.10.0/swagger-ui.css">
  <style>
    body { margin: 0; padding: 0; }
    .topbar { display: none !important; }
    .swagger-ui .information-container { margin: 50px 0; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.10.0/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.10.0/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      const ui = SwaggerUIBundle({
        url: window.location.origin + window.location.pathname.replace('/api-docs', '/openapi.json'),
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout",
        docExpansion: "list",
        defaultModelsExpandDepth: 1,
        defaultModelExpandDepth: 1,
        displayRequestDuration: true,
        filter: true,
        showExtensions: true,
        showCommonExtensions: true,
        tryItOutEnabled: true
      });
      window.ui = ui;
    };
  </script>
</body>
</html>`;
  res.send(html);
});

// Endpoint JSON pour la spécification OpenAPI
app.get('/openapi.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json(swaggerDocument);
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/instructors', instructorRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/push-notifications', pushNotificationRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/wave', waveRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée'
  });
});

// Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Erreur serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Export de l'app Express comme Cloud Function (v2)
export const api = functions.https.onRequest(app);
