/**
 * Routes pour la gestion des paiements
 */

import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';

const router = Router();
const paymentController = new PaymentController();

/**
 * @swagger
 * /payments:
 *   post:
 *     summary: Crée un nouveau paiement
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - enrollmentId
 *               - courseId
 *               - amount
 *               - paymentMethod
 *             properties:
 *               userId:
 *                 type: string
 *               enrollmentId:
 *                 type: string
 *               courseId:
 *                 type: string
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *                 default: XOF
 *               paymentMethod:
 *                 type: string
 *                 enum: [orange-money, wave, free-money, card]
 *               customerPhoneNumber:
 *                 type: string
 *                 description: Requis pour orange-money
 *               customerFirstName:
 *                 type: string
 *               customerLastName:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Paiement créé avec succès
 */
router.post('/', (req, res) => paymentController.create(req, res));

/**
 * @swagger
 * /payments:
 *   get:
 *     summary: Récupère tous les paiements
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: Liste des paiements
 */
router.get('/', (req, res) => paymentController.getAll(req, res));

/**
 * @swagger
 * /payments/{id}:
 *   get:
 *     summary: Récupère un paiement par ID
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Paiement trouvé
 */
router.get('/:id', (req, res) => paymentController.getById(req, res));

/**
 * @swagger
 * /payments/user/{userId}:
 *   get:
 *     summary: Récupère tous les paiements d'un utilisateur
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des paiements
 */
router.get('/user/:userId', (req, res) => paymentController.getByUserId(req, res));

/**
 * @swagger
 * /payments/enrollment/{enrollmentId}:
 *   get:
 *     summary: Récupère tous les paiements d'une inscription
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: enrollmentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des paiements
 */
router.get('/enrollment/:enrollmentId', (req, res) => paymentController.getByEnrollmentId(req, res));

/**
 * @swagger
 * /payments/status/{status}:
 *   get:
 *     summary: Récupère tous les paiements par statut
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [PENDING, SUCCESS, FAILED, CANCELLED, EXPIRED]
 *     responses:
 *       200:
 *         description: Liste des paiements
 */
router.get('/status/:status', (req, res) => paymentController.getByStatus(req, res));

/**
 * @swagger
 * /payments/{id}/check:
 *   get:
 *     summary: Vérifie le statut d'un paiement Orange Money
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Statut du paiement
 */
router.get('/:id/check', (req, res) => paymentController.checkStatus(req, res));

/**
 * @swagger
 * /payments/{id}/cancel:
 *   post:
 *     summary: Annule un paiement en attente
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Paiement annulé
 */
router.post('/:id/cancel', (req, res) => paymentController.cancel(req, res));

/**
 * @swagger
 * /payments/webhook/orange-money:
 *   post:
 *     summary: Webhook pour les notifications Orange Money
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook traité
 */
router.post('/webhook/orange-money', (req, res) => paymentController.handleWebhook(req, res));

/**
 * @swagger
 * /payments/{id}:
 *   delete:
 *     summary: Supprime un paiement
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Paiement supprimé
 */
router.delete('/:id', (req, res) => paymentController.delete(req, res));

export default router;
