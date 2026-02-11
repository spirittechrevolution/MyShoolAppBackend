/**
 * Routes pour les paiements Wave
 */

import { Router } from 'express';
import { waveController } from '../controllers/wave.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Wave Payments
 *   description: Intégration des paiements Wave
 */

/**
 * @swagger
 * /wave/create-payment:
 *   post:
 *     summary: Créer un paiement Wave pour un cours
 *     tags: [Wave Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courseId
 *               - userId
 *             properties:
 *               courseId:
 *                 type: string
 *                 description: ID du cours à acheter
 *                 example: "javascript-intro-001"
 *               userId:
 *                 type: string
 *                 description: ID de l'utilisateur
 *                 example: "uGbrU72VFWfWZcUkvk31QaOi7tG3"
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
 *                     amount:
 *                       type: number
 *                       example: 15000
 *                     currency:
 *                       type: string
 *                       example: "XOF"
 *                 message:
 *                   type: string
 *                   example: "Paiement Wave créé avec succès"
 *       400:
 *         description: Données manquantes ou invalides
 *       404:
 *         description: Cours ou utilisateur non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.post('/create-payment', (req, res) => waveController.createCoursePayment(req, res));

/**
 * @swagger
 * /wave/payment-status/{paymentId}:
 *   get:
 *     summary: Vérifier le statut d'un paiement Wave
 *     tags: [Wave Payments]
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du paiement Wave
 *     responses:
 *       200:
 *         description: Statut du paiement récupéré
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
 *                     id:
 *                       type: string
 *                       example: "wave_12345"
 *                     checkout_status:
 *                       type: string
 *                       enum: [pending, successful, cancelled, failed]
 *                       example: "successful"
 *                     amount:
 *                       type: number
 *                       example: 15000
 *                     currency:
 *                       type: string
 *                       example: "XOF"
 *       500:
 *         description: Erreur lors de la récupération du statut
 */
router.get('/payment-status/:paymentId', (req, res) => waveController.getPaymentStatus(req, res));

/**
 * @swagger
 * /wave/confirm-payment:
 *   post:
 *     summary: Confirmer un paiement après retour depuis Wave
 *     tags: [Wave Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentId
 *               - userId
 *               - courseId
 *             properties:
 *               paymentId:
 *                 type: string
 *                 description: ID du paiement Wave
 *                 example: "wave_12345"
 *               userId:
 *                 type: string
 *                 description: ID de l'utilisateur
 *                 example: "uGbrU72VFWfWZcUkvk31QaOi7tG3"
 *               courseId:
 *                 type: string
 *                 description: ID du cours
 *                 example: "javascript-intro-001"
 *     responses:
 *       200:
 *         description: Paiement confirmé avec succès
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
 *                     status:
 *                       type: string
 *                       example: "completed"
 *                     enrollmentCreated:
 *                       type: boolean
 *                       example: true
 *                 message:
 *                   type: string
 *                   example: "Paiement confirmé et inscription créée"
 *       400:
 *         description: Paiement non confirmé ou données invalides
 *       500:
 *         description: Erreur serveur
 */
router.post('/confirm-payment', (req, res) => waveController.confirmPayment(req, res));

/**
 * @swagger
 * /wave/webhook:
 *   post:
 *     summary: Webhook Wave pour les notifications de paiement
 *     tags: [Wave Payments]
 *     description: Endpoint appelé par Wave pour notifier les changements de statut de paiement
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 example: "checkout.completed"
 *               data:
 *                 type: object
 *                 description: Données du paiement Wave
 *     responses:
 *       200:
 *         description: Webhook traité avec succès
 *       401:
 *         description: Signature invalide
 *       500:
 *         description: Erreur lors du traitement du webhook
 */
router.post('/webhook', (req, res) => waveController.handleWebhook(req, res));

// Endpoint de test pour simuler confirmation de paiement
router.post('/test-confirm/:wavePaymentId', (req, res) => waveController.testConfirmPayment(req, res));

export default router;