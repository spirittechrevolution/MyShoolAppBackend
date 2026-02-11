/**
 * Routes de gestion des parrainages
 */

import { Router } from 'express';
import { referralController } from '../controllers/referral.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Referrals
 *   description: Gestion des parrainages et codes de parrainage
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Referral:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID du parrainage
 *         referrerId:
 *           type: string
 *           description: ID de l'utilisateur parrain
 *         referredUserId:
 *           type: string
 *           description: ID de l'utilisateur parrainé
 *         referralCode:
 *           type: string
 *           description: Code de parrainage (REF_XXXX_XXXXXX)
 *         status:
 *           type: string
 *           enum: [PENDING, COMPLETED, EXPIRED, CANCELLED]
 *           description: Statut du parrainage
 *         bonusAmount:
 *           type: number
 *           description: Montant du bonus en centimes
 *         bonusType:
 *           type: string
 *           enum: [DISCOUNT, FREE_COURSE, POINTS]
 *           description: Type de bonus
 *         clicks:
 *           type: number
 *           description: Nombre de clics sur le lien
 *         conversions:
 *           type: number
 *           description: Nombre de conversions réussies
 *         createdAt:
 *           type: string
 *           format: date-time
 *         completedAt:
 *           type: string
 *           format: date-time
 *         expiresAt:
 *           type: string
 *           format: date-time
 *         metadata:
 *           type: object
 *           properties:
 *             deepLink:
 *               type: string
 *             webLink:
 *               type: string
 *             shareText:
 *               type: string
 *             source:
 *               type: string
 *     ReferralStats:
 *       type: object
 *       properties:
 *         totalReferrals:
 *           type: number
 *         activeReferrals:
 *           type: number
 *         completedReferrals:
 *           type: number
 *         expiredReferrals:
 *           type: number
 *         totalClicks:
 *           type: number
 *         totalConversions:
 *           type: number
 *         conversionRate:
 *           type: number
 *         totalEarnings:
 *           type: number
 *         pendingBonus:
 *           type: number
 */

/**
 * @swagger
 * /referrals/generate:
 *   post:
 *     summary: Génère un nouveau lien de parrainage
 *     tags: [Referrals]
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
 *                 description: ID de l'utilisateur parrain
 *               bonusAmount:
 *                 type: number
 *                 description: Montant du bonus en centimes (défaut 500)
 *               bonusType:
 *                 type: string
 *                 enum: [DISCOUNT, FREE_COURSE, POINTS]
 *                 description: Type de bonus (défaut DISCOUNT)
 *     responses:
 *       201:
 *         description: Lien de parrainage créé avec succès
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
 *                     code:
 *                       type: string
 *                     deepLink:
 *                       type: string
 *                     webLink:
 *                       type: string
 *                     shareText:
 *                       type: string
 *                     bonusAmount:
 *                       type: number
 *                     expiresAt:
 *                       type: string
 *       400:
 *         description: Données invalides
 *       500:
 *         description: Erreur serveur
 */
router.post('/generate', (req, res) => referralController.generateReferralLink(req, res));

/**
 * @swagger
 * /referrals/user/{userId}:
 *   get:
 *     summary: Récupère tous les parrainages d'un utilisateur
 *     tags: [Referrals]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Liste des parrainages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Referral'
 *                 count:
 *                   type: number
 *       500:
 *         description: Erreur serveur
 */
router.get('/user/:userId', (req, res) => referralController.getUserReferrals(req, res));

/**
 * @swagger
 * /referrals/user/{userId}/stats:
 *   get:
 *     summary: Récupère les statistiques de parrainage d'un utilisateur
 *     tags: [Referrals]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Statistiques de parrainage
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ReferralStats'
 *       500:
 *         description: Erreur serveur
 */
router.get('/user/:userId/stats', (req, res) => referralController.getUserStats(req, res));

/**
 * @swagger
 * /referrals/track-click:
 *   post:
 *     summary: Enregistre un clic sur un lien de parrainage
 *     tags: [Referrals]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *                 description: Code de parrainage
 *               source:
 *                 type: string
 *                 description: Source du clic (whatsapp, sms, email, etc.)
 *     responses:
 *       200:
 *         description: Clic enregistré avec succès
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
 *                     code:
 *                       type: string
 *                     clicks:
 *                       type: number
 *                     message:
 *                       type: string
 *       400:
 *         description: Code manquant
 *       404:
 *         description: Code non trouvé ou expiré
 *       500:
 *         description: Erreur serveur
 */
router.post('/track-click', (req, res) => referralController.trackClick(req, res));

/**
 * @swagger
 * /referrals/validate:
 *   post:
 *     summary: Valide un code de parrainage lors de l'inscription
 *     tags: [Referrals]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - userId
 *             properties:
 *               code:
 *                 type: string
 *                 description: Code de parrainage
 *               userId:
 *                 type: string
 *                 description: ID du nouvel utilisateur
 *     responses:
 *       200:
 *         description: Code validé et bonus appliqué
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
 *                     bonusAmount:
 *                       type: number
 *                     bonusType:
 *                       type: string
 *                     referrerId:
 *                       type: string
 *                     message:
 *                       type: string
 *       400:
 *         description: Données invalides ou code invalide
 *       404:
 *         description: Code non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.post('/validate', (req, res) => referralController.validateReferralCode(req, res));

/**
 * @swagger
 * /referrals/code/{code}:
 *   get:
 *     summary: Récupère un parrainage par son code
 *     tags: [Referrals]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Code de parrainage
 *     responses:
 *       200:
 *         description: Détails du parrainage
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Referral'
 *       404:
 *         description: Code non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get('/code/:code', (req, res) => referralController.getReferralByCode(req, res));

/**
 * @swagger
 * /referrals/{id}:
 *   get:
 *     summary: Récupère un parrainage par ID
 *     tags: [Referrals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du parrainage
 *     responses:
 *       200:
 *         description: Détails du parrainage
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Referral'
 *       404:
 *         description: Parrainage non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get('/:id', (req, res) => referralController.getById(req, res));

/**
 * @swagger
 * /referrals:
 *   get:
 *     summary: Récupère tous les parrainages (Admin)
 *     tags: [Referrals]
 *     responses:
 *       200:
 *         description: Liste de tous les parrainages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Referral'
 *                 count:
 *                   type: number
 *       500:
 *         description: Erreur serveur
 */
router.get('/', (req, res) => referralController.getAll(req, res));

/**
 * @swagger
 * /referrals/{id}/cancel:
 *   post:
 *     summary: Annule un parrainage
 *     tags: [Referrals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du parrainage
 *     responses:
 *       200:
 *         description: Parrainage annulé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Erreur serveur
 */
router.post('/:id/cancel', (req, res) => referralController.cancel(req, res));

/**
 * @swagger
 * /referrals/{id}:
 *   delete:
 *     summary: Supprime un parrainage
 *     tags: [Referrals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du parrainage
 *     responses:
 *       200:
 *         description: Parrainage supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Erreur serveur
 */
router.delete('/:id', (req, res) => referralController.delete(req, res));

export default router;
