/**
 * Routes pour la gestion des codes promo
 */

import { Router, Request, Response } from 'express';
import { PromoCodeController } from '../controllers/promo-code.controller';

const router = Router();
const promoCodeController = new PromoCodeController();

/**
 * @swagger
 * /api/codes-promo:
 *   post:
 *     summary: Créer un nouveau code promo
 *     tags: [PromosCodes]
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
 *               discountType:
 *                 type: string
 *                 enum: [percentage, fixed]
 *               discountValue:
 *                 type: number
 *               expiresAt:
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
 *         description: Code promo créé
 *       400:
 *         description: Données invalides
 */
router.post('/', (req: Request, res: Response) => promoCodeController.create(req, res));

/**
 * @swagger
 * /api/codes-promo:
 *   get:
 *     summary: Récupérer tous les codes promo
 *     tags: [PromosCodes]
 *     responses:
 *       200:
 *         description: Liste des codes promo
 */
router.get('/', (req: Request, res: Response) => promoCodeController.getAll(req, res));

/**
 * @swagger
 * /api/codes-promo/{code}:
 *   get:
 *     summary: Récupérer un code promo
 *     tags: [PromosCodes]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails du code promo
 *       404:
 *         description: Non trouvé
 */
router.get('/:code', (req: Request, res: Response) => promoCodeController.getByCode(req, res));

/**
 * @swagger
 * /api/codes-promo/{code}:
 *   put:
 *     summary: Mettre à jour un code promo
 *     tags: [PromosCodes]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Code promo mis à jour
 *       404:
 *         description: Non trouvé
 */
router.put('/:code', (req: Request, res: Response) => promoCodeController.update(req, res));

/**
 * @swagger
 * /api/codes-promo/{code}:
 *   delete:
 *     summary: Supprimer un code promo
 *     tags: [PromosCodes]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Code promo supprimé
 *       404:
 *         description: Non trouvé
 */
router.delete('/:code', (req: Request, res: Response) => promoCodeController.delete(req, res));

/**
 * @swagger
 * /api/codes-promo/validate/{code}:
 *   post:
 *     summary: Valider un code promo
 *     tags: [PromosCodes]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
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
 *         description: Code validé
 *       400:
 *         description: Code invalide
 */
router.post('/validate/:code', (req: Request, res: Response) => promoCodeController.validate(req, res));

/**
 * @swagger
 * /api/codes-promo/influencer/{influenceurId}:
 *   get:
 *     summary: Récupérer les codes d'un influenceur
 *     tags: [PromosCodes]
 *     parameters:
 *       - in: path
 *         name: influenceurId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des codes
 */
router.get('/influencer/:influenceurId', (req: Request, res: Response) => promoCodeController.getByInfluencer(req, res));

export default router;
