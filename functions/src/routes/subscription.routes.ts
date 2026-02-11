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
 *   description: Gestion des abonnements par catégorie de cours
 */

/**
 * @swagger
 * /subscriptions/create-payment:
 *   post:
 *     summary: Créer un paiement Wave pour un abonnement à une catégorie
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
 *               - category
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
 *               category:
 *                 type: string
 *                 description: Catégorie de cours à débloquer
 *                 example: "Mathématiques"
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
 *                       example: 3000
 *                     plan:
 *                       type: string
 *                       example: "MONTHLY"
 *                     category:
 *                       type: string
 *                       example: "Mathématiques"
 *                     currency:
 *                       type: string
 *                       example: "XOF"
 *                 message:
 *                   type: string
 *                   example: "Paiement d'abonnement créé pour la catégorie \"Mathématiques\""
 *       400:
 *         description: Données invalides ou abonnement actif existant pour cette catégorie
 *       404:
 *         description: Utilisateur non trouvé
 */
router.post('/create-payment', subscriptionController.createSubscriptionPayment.bind(subscriptionController));

/**
 * @swagger
 * /subscriptions/plans:
 *   get:
 *     summary: Obtenir les plans d'abonnement disponibles pour une catégorie
 *     tags: [Subscriptions]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Catégorie de cours (optionnel)
 *         example: "Mathématiques"
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
 *                   type: object
 *                   properties:
 *                     category:
 *                       type: string
 *                       example: "Mathématiques"
 *                     plans:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           plan:
 *                             type: string
 *                             example: "MONTHLY"
 *                           price:
 *                             type: number
 *                             example: 3000
 *                           duration:
 *                             type: string
/**
 * @swagger
 * /subscriptions/active/{userId}:
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
 * /subscriptions/user/{userId}:
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
 * /subscriptions/{subscriptionId}/cancel:
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
 * /subscriptions/check-access/{userId}:
 *   get:
 *     summary: Vérifier les abonnements actifs d'un utilisateur
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
 *         description: Statut d'accès avec liste des abonnements
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
 *                     activeSubscriptions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           category:
 *                             type: string
 *                             example: "Mathématiques"
 *                           plan:
 *                             type: string
 *                             example: "MONTHLY"
 *                           endDate:
 *                             type: string
 *                             format: date-time
 */
router.get('/check-access/:userId', subscriptionController.checkUnlimitedAccess.bind(subscriptionController));

export default router;
