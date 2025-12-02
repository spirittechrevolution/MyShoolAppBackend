// Load environment variables FIRST
import dotenv from 'dotenv';
dotenv.config();

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.config';
import userRoutes from './routes/user.routes';
import courseRoutes from './routes/course.routes';
import chapterRoutes from './routes/chapter.routes';
import lessonRoutes from './routes/lesson.routes';
import exerciseRoutes from './routes/exercise.routes';
import enrollmentRoutes from './routes/enrollment.routes';
import instructorRoutes from './routes/instructor.routes';
import paymentRoutes from './routes/payment.routes';
import referralRoutes from './routes/referral.routes';
import './config/firebase.config'; // Initialize Firebase

const app: Application = express();
const PORT = process.env.PORT || 3000;

// CORS Configuration - Autoriser les ports frontend 4200-4205
const allowedOrigins = [
  'http://localhost:4200',
  'http://localhost:4201',
  'http://localhost:4202',
  'http://localhost:4203',
  'http://localhost:4204',
  'http://localhost:4205'
];

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Autoriser les requêtes sans origin (comme Postman) ou les origins autorisées
    if (!origin || allowedOrigins.includes(origin)) {
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

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'MySchool API - Bienvenue',
    version: '1.0.0',
    documentation: '/api-docs',
    endpoints: {
      users: '/api/users',
      courses: '/api/courses',
      chapters: '/api/chapters',
      lessons: '/api/lessons',
      exercises: '/api/exercises',
      enrollments: '/api/enrollments',
      instructors: '/api/instructors',
      payments: '/api/payments',
      referrals: '/api/referrals'
    }
  });
});

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'MySchool API Documentation'
}));

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

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée'
  });
});

// Error Handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Erreur serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start Server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Serveur MySchool démarré sur http://localhost:${PORT}`);
    console.log(`📚 Documentation API disponible sur http://localhost:${PORT}`);
  });
}

export default app;
