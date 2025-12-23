/**
 * Middleware pour vérifier l'accès aux cours
 * Un utilisateur a accès à un cours si :
 * 1. Il a un abonnement actif (accès illimité)
 * 2. Il a acheté le cours individuellement
 */

import { Request, Response, NextFunction } from 'express';
import { SubscriptionService } from '../services/subscription.service';
import { EnrollmentService } from '../services/enrollment.service';

const subscriptionService = new SubscriptionService();
const enrollmentService = new EnrollmentService();

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

    // Vérifier si l'utilisateur a un abonnement actif
    const hasUnlimitedAccess = await subscriptionService.hasUnlimitedAccess(userId);

    if (hasUnlimitedAccess) {
      // L'utilisateur a un abonnement actif → accès illimité
      console.log(`✅ Accès autorisé via abonnement - User: ${userId}, Course: ${courseId}`);
      next();
      return;
    }

    // Vérifier si l'utilisateur a acheté ce cours individuellement
    const enrollment = await enrollmentService.getUserEnrollment(userId, courseId);

    if (enrollment) {
      // L'utilisateur a acheté le cours
      console.log(`✅ Accès autorisé via achat individuel - User: ${userId}, Course: ${courseId}`);
      next();
      return;
    }

    // Aucun accès
    res.status(403).json({
      success: false,
      message: 'Accès refusé. Vous devez acheter ce cours ou souscrire à un abonnement.',
      data: {
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

    // Vérifier l'accès au cours
    const hasUnlimitedAccess = await subscriptionService.hasUnlimitedAccess(userId);
    const enrollment = !hasUnlimitedAccess ? await enrollmentService.getUserEnrollment(userId, courseId) : null;

    if (hasUnlimitedAccess || enrollment) {
      console.log(`✅ Accès exercice autorisé - User: ${userId}, Exercise: ${exerciseId}`);
      next();
      return;
    }

    res.status(403).json({
      success: false,
      message: 'Accès refusé. Vous devez avoir accès au cours pour accéder à cet exercice.'
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
      const hasUnlimitedAccess = await subscriptionService.hasUnlimitedAccess(userId);
      
      // Ajouter les informations d'accès dans les headers de réponse
      res.setHeader('X-Has-Subscription', hasUnlimitedAccess.toString());
      
      if (hasUnlimitedAccess) {
        const activeSubscription = await subscriptionService.getActiveSubscription(userId);
        if (activeSubscription) {
          res.setHeader('X-Subscription-Plan', activeSubscription.plan);
          res.setHeader('X-Subscription-End-Date', activeSubscription.endDate.toISOString());
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
