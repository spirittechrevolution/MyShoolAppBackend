/**
 * Routes pour la gestion des notifications push FCM
 */

import { Router } from 'express';
import { PushNotificationController } from '../controllers/push-notification.controller';

const router = Router();
const controller = new PushNotificationController();

/**
 * @swagger
 * tags:
 *   name: Push Notifications
 *   description: Gestion des notifications push Firebase Cloud Messaging
 */

/**
 * @swagger
 * /push-notifications/register-token:
 *   post:
 *     summary: Enregistrer un token FCM
 *     tags: [Push Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - token
 *               - platform
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID de l'utilisateur
 *               token:
 *                 type: string
 *                 description: Token FCM du device
 *               platform:
 *                 type: string
 *                 enum: [ios, android, web]
 *                 description: Plateforme du device
 *               deviceId:
 *                 type: string
 *                 description: ID unique du device
 *               deviceName:
 *                 type: string
 *                 description: Nom du device
 *     responses:
 *       200:
 *         description: Token enregistré avec succès
 *       400:
 *         description: Données invalides
 */
router.post('/register-token', (req, res) => controller.registerToken(req, res));

/**
 * @swagger
 * /push-notifications/remove-token:
 *   delete:
 *     summary: Supprimer un token FCM
 *     tags: [Push Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - token
 *             properties:
 *               userId:
 *                 type: string
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token supprimé avec succès
 */
router.delete('/remove-token', (req, res) => controller.removeToken(req, res));

/**
 * @swagger
 * /push-notifications/send-test:
 *   post:
 *     summary: Envoyer une notification test
 *     tags: [Push Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Notification envoyée
 */
router.post('/send-test', (req, res) => controller.sendTestNotification(req, res));

/**
 * @swagger
 * /push-notifications/user/{userId}:
 *   get:
 *     summary: Récupérer les notifications d'un utilisateur
 *     tags: [Push Notifications]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Liste des notifications
 */
router.get('/user/:userId', (req, res) => controller.getUserNotifications(req, res));

/**
 * @swagger
 * /push-notifications/{id}/read:
 *   patch:
 *     summary: Marquer une notification comme lue
 *     tags: [Push Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marquée comme lue
 */
router.patch('/:id/read', (req, res) => controller.markAsRead(req, res));

/**
 * @swagger
 * /push-notifications/tokens/{userId}:
 *   get:
 *     summary: Récupérer les tokens FCM d'un utilisateur (debug)
 *     tags: [Push Notifications]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des tokens
 */
router.get('/tokens/:userId', (req, res) => controller.getUserTokens(req, res));

export default router;
