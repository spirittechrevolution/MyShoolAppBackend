/**
 * Middleware pour vérifier l'accès aux cours
 * Un utilisateur a accès à un cours si :
 * 1. ELEMENTAIRE : Abonnement CLASSE + cours.classe === subscription.classe
 * 2. AUTRES : Abonnement MATIERE (3 matières) + cours.classe === subscription.classe + cours.matiereId dans subscription.matieres
 * 3. Achat individuel du cours
 */

import { Request, Response, NextFunction } from 'express';
import { SubscriptionService } from '../services/subscription.service';
import { EnrollmentService } from '../services/enrollment.service';
import { CourseService } from '../services/course.service';
import { UserService } from '../services/user.service';

const subscriptionService = new SubscriptionService();
const enrollmentService = new EnrollmentService();
const courseService = new CourseService();
const userService = new UserService();

export interface CourseAccessRequest extends Request {
  userId?: string;
  courseId?: string;
}

/**
 * Vérifier si l'utilisateur a accès au cours
 */
export async function checkCourseAccess(
  req: CourseAccessRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId || req.params.userId || req.body.userId;
    const courseId = req.params.courseId || req.body.courseId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentification requise'
      });
      return;
    }

    if (!courseId) {
      res.status(400).json({
        success: false,
        message: 'ID du cours requis'
      });
      return;
    }

    // Récupérer le cours
    const course = await courseService.getById(courseId);
    if (!course) {
      res.status(404).json({
        success: false,
        message: 'Cours non trouvé'
      });
      return;
    }

    // Récupérer l'utilisateur
    const user = await userService.getById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
      return;
    }

    // Vérifier si l'utilisateur a acheté ce cours individuellement
    const enrollment = await enrollmentService.getUserEnrollment(userId, courseId);
    if (enrollment) {
      console.log(`✅ Accès autorisé via achat individuel - User: ${userId}, Course: ${courseId}`);
      next();
      return;
    }

    // Vérifier l'accès via abonnement
    const hasAccess = await subscriptionService.hasAccessToCourse(userId, courseId);
    
    if (hasAccess) {
      console.log(`✅ Accès autorisé via abonnement - User: ${userId}, Course: ${courseId}`);
      next();
      return;
    }

    // Aucun accès - générer un message détaillé
    const userClasse = user.classe || 'non définie';
    const courseClasse = course.classe || 'non définie';
    
    let errorMessage = 'Accès refusé. ';
    
    if (userClasse !== courseClasse) {
      errorMessage += `Ce cours est pour la classe "${courseClasse}" mais vous êtes en "${userClasse}". `;
    }
    
    errorMessage += 'Vous devez acheter ce cours individuellement ou souscrire à un abonnement.';

    res.status(403).json({
      success: false,
      message: errorMessage,
      data: {
        courseClasse: courseClasse,
        userClasse: userClasse,
        courseMatiere: course.matiereId,
        hasSubscription: false,
        hasCourseAccess: false,
        options: {
          buyCourse: `/api/wave/create-payment`,
          subscribe: `/api/subscriptions/plans`
        }
      }
    });

  } catch (error: any) {
    console.error('❌ Erreur vérification accès cours:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification de l\'accès'
    });
  }
}

/**
 * Vérifier si l'utilisateur peut accéder à un exercice
 * (Nécessite l'accès au cours parent)
 */
export async function checkExerciseAccess(
  req: CourseAccessRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId || req.params.userId || req.body.userId;
    const exerciseId = req.params.exerciseId || req.body.exerciseId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentification requise'
      });
      return;
    }

    if (!exerciseId) {
      res.status(400).json({
        success: false,
        message: 'ID de l\'exercice requis'
      });
      return;
    }

    // Récupérer l'exercice pour obtenir le courseId
    const { ExerciseService } = await import('../services/exercise.service');
    const exerciseService = new ExerciseService();
    const exercise = await exerciseService.getById(exerciseId);

    if (!exercise) {
      res.status(404).json({
        success: false,
        message: 'Exercice non trouvé'
      });
      return;
    }

    const courseId = exercise.courseId;

    // Récupérer le cours associé
    const course = await courseService.getById(courseId);
    if (!course) {
      res.status(404).json({
        success: false,
        message: 'Cours associé non trouvé'
      });
      return;
    }

    // Vérifier l'accès via achat individuel
    const enrollment = await enrollmentService.getUserEnrollment(userId, courseId);
    
    // Vérifier l'accès via abonnement
    const hasAccess = !enrollment ? await subscriptionService.hasAccessToCourse(userId, courseId) : true;

    if (enrollment || hasAccess) {
      console.log(`✅ Accès exercice autorisé - User: ${userId}, Exercise: ${exerciseId}`);
      next();
      return;
    }

    res.status(403).json({
      success: false,
      message: `Accès refusé. Vous devez avoir accès au cours (classe "${course.classe || 'N/A'}") pour accéder à cet exercice.`
    });

  } catch (error: any) {
    console.error('❌ Erreur vérification accès exercice:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification de l\'accès'
    });
  }
}

/**
 * Middleware optionnel pour enrichir la réponse avec les informations d'accès
 */
export async function enrichWithAccessInfo(
  req: CourseAccessRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId || req.params.userId;

    if (userId) {
      const user = await userService.getById(userId);
      
      if (user) {
        // Vérifier si l'utilisateur a un abonnement actif
        const hasActiveSubscription = user.hasActiveSubscription || false;
        
        // Ajouter les informations d'accès dans les headers de réponse
        res.setHeader('X-Has-Subscription', hasActiveSubscription.toString());
        res.setHeader('X-User-Classe', user.classe || 'non-definie');
        res.setHeader('X-User-Niveau', user.niveauScolaire || 'non-defini');
        
        if (hasActiveSubscription) {
          res.setHeader('X-Subscription-Type', user.classe || 'non-definie');
        }
      }
    }

    next();
  } catch (error) {
    // Ne pas bloquer la requête en cas d'erreur
    console.error('❌ Erreur enrichissement infos accès:', error);
    next();
  }
}
