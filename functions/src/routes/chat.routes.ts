/**
 * Routes Chat AI pour MySchool
 * Endpoints pour le chatbot intelligent
 */

import { Router } from 'express';
import { FaqController } from '../controllers/faq.controller';

const router = Router();
const faqController = new FaqController();

/**
 * @swagger
 * tags:
 *   name: AI Chat
 *   description: Chatbot intelligent avec Gemini AI
 */

/**
 * @swagger
 * /api/chat/ask:
 *   post:
 *     summary: Poser une question au chatbot
 *     tags: [AI Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - question
 *             properties:
 *               userId:
 *                 type: string
 *                 example: user123
 *               question:
 *                 type: string
 *                 example: Comment obtenir mon certificat ?
 *     responses:
 *       200:
 *         description: Réponse du chatbot
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     answer:
 *                       type: string
 *                     source:
 *                       type: string
 *                       enum: [faq, ai]
 *                     faqId:
 *                       type: string
 *       400:
 *         description: Données invalides
 */
router.post('/ask', (req, res) => faqController.askQuestion(req, res));

/**
 * @swagger
 * /api/chat/history/{userId}:
 *   get:
 *     summary: Récupérer l'historique de conversation
 *     tags: [AI Chat]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Historique de conversation
 *       404:
 *         description: Aucune conversation trouvée
 */
router.get('/history/:userId', (req, res) => faqController.getConversationHistory(req, res));

/**
 * @swagger
 * /api/chat/feedback:
 *   post:
 *     summary: Marquer un message comme utile ou pas
 *     tags: [AI Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - messageIndex
 *               - helpful
 *             properties:
 *               userId:
 *                 type: string
 *               messageIndex:
 *                 type: number
 *               helpful:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Feedback enregistré
 */
router.post('/feedback', (req, res) => faqController.markMessageHelpful(req, res));

/**
 * @swagger
 * /api/chat/history/{userId}:
 *   delete:
 *     summary: Supprimer l'historique de conversation
 *     tags: [AI Chat]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Historique supprimé
 */
router.delete('/history/:userId', (req, res) => faqController.clearConversation(req, res));

export default router;
