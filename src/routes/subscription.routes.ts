/**
 * Routes pour les abonnements
 */

import { Router } from 'express';
import { SubscriptionController } from '../controllers/subscription.controller';

const router = Router();
const subscriptionController = new SubscriptionController();

/**
 * @swagger
 * tags:
 *   name: Subscriptions
 *   description: Gestion des abonnements
 */

/**
 * POST /api/subscriptions/create-payment
 * Créer un paiement Wave pour un abonnement
 */
router.post('/create-payment', (req, res) => subscriptionController.createSubscriptionPayment(req, res));

/**
 * GET /api/subscriptions/active/:userId
 * Obtenir l'abonnement actif d'un utilisateur
 */
router.get('/active/:userId', (req, res) => subscriptionController.getActiveSubscription(req, res));

/**
 * GET /api/subscriptions/user/:userId
 * Obtenir tous les abonnements d'un utilisateur
 */
router.get('/user/:userId', (req, res) => subscriptionController.getUserSubscriptions(req, res));

/**
 * POST /api/subscriptions/:subscriptionId/cancel
 * Annuler un abonnement
 */
router.post('/:subscriptionId/cancel', (req, res) => subscriptionController.cancelSubscription(req, res));

/**
 * GET /api/subscriptions/check-access/:userId/:courseId
 * Vérifier l'accès à un cours
 */
router.get('/check-course-access/:userId/:courseId', (req, res) => subscriptionController.checkCourseAccess(req, res));

/**
 * GET /api/subscriptions/sync-status/:userId
 * Synchroniser le statut de l'abonnement après reconnexion
 */
router.get('/sync-status/:userId', (req, res) => subscriptionController.syncSubscriptionStatus(req, res));

export default router;
