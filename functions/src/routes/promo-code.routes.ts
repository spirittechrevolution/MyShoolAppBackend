/**
 * Routes pour la gestion des codes promo
 */

import { Router } from 'express';
import { PromoCodeController } from '../controllers/promo-code.controller';

const router = Router();
const promoCodeController = new PromoCodeController();

/**
 * @swagger
 * components:
 *   schemas:
 *     PromoCode:
 *       type: object
 *       properties:
 *         code:
 *           type: string
 *           description: Code promo unique
 *         discountType:
 *           type: string
 *           enum: [percentage, fixed]
 *           description: Type de réduction
 *         discountValue:
 *           type: number
 *           description: Valeur de la réduction
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           description: Date d'expiration
 *         maxUsage:
 *           type: number
 *           description: Nombre maximum d'utilisations
 *         usageCount:
 *           type: number
 *           description: Nombre d'utilisations actuelles
 *         isActive:
 *           type: boolean
 *           description: État actif du code
 *         description:
 *           type: string
 *           description: Description du code promo
 *         influenceurId:
 *           type: string
 *           description: ID de l'influenceur associé
 *         commissionType:
 *           type: string
 *           enum: [percent, fixed]
 *           description: Type de commission pour l'influenceur
 *         commissionValue:
 *           type: number
 *           description: Valeur de la commission
 */

/**
 * @swagger
 * /api/codes-promo:
 *   post:
 *     summary: Créer un nouveau code promo
 *     tags: [PromesCodes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - discountType
 *               - discountValue
 *               - expiresAt
 *             properties:
 *               code:
 *                 type: string
 *                 description: Code promo unique
 *               discountType:
 *                 type: string
 *                 enum: [percentage, fixed]
 *               discountValue:
 *                 type: number
 *               expirusAt:
 *                 type: string
 *                 format: date-time
 *               maxUsage:
 *                 type: number
 *               isActive:
 *                 type: boolean
 *               description:
 *                 type: string
 *               influenceurId:
 *                 type: string
 *               commissionType:
 *                 type: string
 *               commissionValue:
 *                 type: number
 *     responses:
 *       201:
 *         description: Code promo créé avec succès
 *       400:
 *         description: Données invalides
 *       500:
 *         description: Erreur serveur
 */
router.post('/', (req, res) => promoCodeController.create(req, res));

/**
 * @swagger
 * /api/codes-promo:
 *   get:
 *     summary: Récupérer tous les codes promo
 *     tags: [PromesCodes]
 *     responses:
 *       200:
 *         description: Liste des codes promo
 *       500:
 *         description: Erreur serveur
 */
router.get('/', (req, res) => promoCodeController.getAll(req, res));

/**
 * @swagger
 * /api/codes-promo/{code}:
 *   get:
 *     summary: Récupérer un code promo par son code
 *     tags: [PromesCodes]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Code promo
 *     responses:
 *       200:
 *         description: Détails du code promo
 *       404:
 *         description: Code promo non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get('/:code', (req, res) => promoCodeController.getByCode(req, res));

/**
 * @swagger
 * /api/codes-promo/{code}:
 *   put:
 *     summary: Mettre à jour un code promo
 *     tags: [PromesCodes]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Code promo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PromoCode'
 *     responses:
 *       200:
 *         description: Code promo mis à jour avec succès
 *       404:
 *         description: Code promo non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.put('/:code', (req, res) => promoCodeController.update(req, res));

/**
 * @swagger
 * /api/codes-promo/{code}:
 *   delete:
 *     summary: Supprimer un code promo
 *     tags: [PromesCodes]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Code promo
 *     responses:
 *       200:
 *         description: Code promo supprimé avec succès
 *       404:
 *         description: Code promo non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.delete('/:code', (req, res) => promoCodeController.delete(req, res));

/**
 * @swagger
 * /api/codes-promo/validate/{code}:
 *   post:
 *     summary: Valider et appliquer un code promo
 *     tags: [PromesCodes]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Code promo
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Code promo validé avec succès
 *       400:
 *         description: Code invalide ou expiré
 *       404:
 *         description: Code promo non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.post('/validate/:code', (req, res) => promoCodeController.validate(req, res));

/**
 * @swagger
 * /api/codes-promo/influencer/{influenceurId}:
 *   get:
 *     summary: Récupérer les codes promo d'un influenceur
 *     tags: [PromesCodes]
 *     parameters:
 *       - in: path
 *         name: influenceurId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'influenceur
 *     responses:
 *       200:
 *         description: Liste des codes promo de l'influenceur
 *       500:
 *         description: Erreur serveur
 */
router.get('/influencer/:influenceurId', (req, res) => promoCodeController.getByInfluencer(req, res));

export default router;
