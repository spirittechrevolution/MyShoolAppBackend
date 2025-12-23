/**
 * Routes pour les abonnements
 */

import { Router } from 'express';
import { subscriptionController } from '../controllers/subscription.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Subscriptions
 *   description: Gestion des abonnements profil (accès illimité à tous les cours)
 */

/**
 * @swagger
 * /api/subscriptions/create-payment:
 *   post:
 *     summary: Créer un paiement Wave pour un abonnement
 *     tags: [Subscriptions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - plan
 *               - userId
 *             properties:
 *               plan:
 *                 type: string
 *                 enum: [MONTHLY, QUARTERLY, ANNUAL]
 *                 description: Plan d'abonnement
 *                 example: "MONTHLY"
 *               userId:
 *                 type: string
 *                 description: ID de l'utilisateur
 *                 example: "VLzZCBlJstQOWhJy9Xg4MEO7ESK2"
 *     responses:
 *       200:
 *         description: Paiement créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     paymentUrl:
 *                       type: string
 *                       description: URL de redirection vers Wave
 *                       example: "https://checkout.wave.com/pay/abc123"
 *                     paymentId:
 *                       type: string
 *                       example: "wave_12345"
 *                     subscriptionId:
 *                       type: string
 *                       example: "sub_abc123"
 *                     amount:
 *                       type: number
 *                       example: 5000
 *                     plan:
 *                       type: string
 *                       example: "MONTHLY"
 *                     currency:
 *                       type: string
 *                       example: "XOF"
 *                 message:
 *                   type: string
 *                   example: "Paiement d'abonnement créé avec succès"
 *       400:
 *         description: Données invalides ou abonnement actif existant
 *       404:
 *         description: Utilisateur non trouvé
 */
router.post('/create-payment', subscriptionController.createSubscriptionPayment.bind(subscriptionController));

/**
 * @swagger
 * /api/subscriptions/plans:
 *   get:
 *     summary: Obtenir les plans d'abonnement disponibles
 *     tags: [Subscriptions]
 *     responses:
 *       200:
 *         description: Liste des plans disponibles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       plan:
 *                         type: string
 *                         example: "MONTHLY"
 *                       price:
 *                         type: number
 *                         example: 5000
 *                       duration:
 *                         type: string
 *                         example: "1 mois"
 */
router.get('/plans', subscriptionController.getAvailablePlans.bind(subscriptionController));

/**
 * @swagger
 * /api/subscriptions/active/{userId}:
 *   get:
 *     summary: Obtenir l'abonnement actif d'un utilisateur
 *     tags: [Subscriptions]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Abonnement actif trouvé
 *       404:
 *         description: Aucun abonnement actif
 */
router.get('/active/:userId', subscriptionController.getActiveSubscription.bind(subscriptionController));

/**
 * @swagger
 * /api/subscriptions/user/{userId}:
 *   get:
 *     summary: Obtenir tous les abonnements d'un utilisateur
 *     tags: [Subscriptions]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Liste des abonnements
 */
router.get('/user/:userId', subscriptionController.getUserSubscriptions.bind(subscriptionController));

/**
 * @swagger
 * /api/subscriptions/{subscriptionId}/cancel:
 *   post:
 *     summary: Annuler un abonnement
 *     tags: [Subscriptions]
 *     parameters:
 *       - in: path
 *         name: subscriptionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'abonnement
 *     responses:
 *       200:
 *         description: Abonnement annulé avec succès
 */
router.post('/:subscriptionId/cancel', subscriptionController.cancelSubscription.bind(subscriptionController));

/**
 * @swagger
 * /api/subscriptions/check-access/{userId}:
 *   get:
 *     summary: Vérifier si un utilisateur a un accès illimité
 *     tags: [Subscriptions]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Statut d'accès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     hasUnlimitedAccess:
 *                       type: boolean
 *                       example: true
 */
router.get('/check-access/:userId', subscriptionController.checkUnlimitedAccess.bind(subscriptionController));

export default router;
