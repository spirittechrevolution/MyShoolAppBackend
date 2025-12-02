/**
 * Routes FAQ pour MySchool
 * Endpoints pour la gestion des FAQs
 */

import { Router } from 'express';
import { FaqController } from '../controllers/faq.controller';

const router = Router();
const faqController = new FaqController();

/**
 * @swagger
 * tags:
 *   name: FAQ
 *   description: Gestion des questions fréquemment posées
 */

/**
 * @swagger
 * /api/faqs:
 *   post:
 *     summary: Créer une nouvelle FAQ
 *     tags: [FAQ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - question
 *               - answer
 *               - category
 *               - order
 *             properties:
 *               question:
 *                 type: string
 *                 example: Comment payer un cours ?
 *               answer:
 *                 type: string
 *                 example: Vous pouvez payer via Orange Money, Wave ou Free Money
 *               category:
 *                 type: string
 *                 enum: [general, payments, courses, enrollment, certificates, technical, account, referral]
 *               order:
 *                 type: number
 *                 example: 1
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["paiement", "orange-money"]
 *               isActive:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: FAQ créée avec succès
 *       400:
 *         description: Données invalides
 */
router.post('/', (req, res) => faqController.create(req, res));

/**
 * @swagger
 * /api/faqs:
 *   get:
 *     summary: Récupérer toutes les FAQs
 *     tags: [FAQ]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrer par catégorie
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filtrer par statut actif
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Nombre maximum de résultats
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Pagination offset
 *     responses:
 *       200:
 *         description: Liste des FAQs
 */
router.get('/', (req, res) => faqController.getAll(req, res));

/**
 * @swagger
 * /api/faqs/search:
 *   get:
 *     summary: Rechercher des FAQs
 *     tags: [FAQ]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Texte à rechercher
 *     responses:
 *       200:
 *         description: Résultats de la recherche
 */
router.get('/search', (req, res) => faqController.search(req, res));

/**
 * @swagger
 * /api/faqs/stats:
 *   get:
 *     summary: Récupérer les statistiques des FAQs
 *     tags: [FAQ]
 *     responses:
 *       200:
 *         description: Statistiques
 */
router.get('/stats', (req, res) => faqController.getStats(req, res));

/**
 * @swagger
 * /api/faqs/category/{category}:
 *   get:
 *     summary: Récupérer les FAQs par catégorie
 *     tags: [FAQ]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *           enum: [general, payments, courses, enrollment, certificates, technical, account, referral]
 *     responses:
 *       200:
 *         description: FAQs de la catégorie
 */
router.get('/category/:category', (req, res) => faqController.getByCategory(req, res));

/**
 * @swagger
 * /api/faqs/{id}:
 *   get:
 *     summary: Récupérer une FAQ par ID
 *     tags: [FAQ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: FAQ trouvée
 *       404:
 *         description: FAQ non trouvée
 */
router.get('/:id', (req, res) => faqController.getById(req, res));

/**
 * @swagger
 * /api/faqs/{id}:
 *   put:
 *     summary: Mettre à jour une FAQ
 *     tags: [FAQ]
 *     parameters:
 *       - in: path
 *         name: id
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
 *         description: FAQ mise à jour
 *       404:
 *         description: FAQ non trouvée
 */
router.put('/:id', (req, res) => faqController.update(req, res));

/**
 * @swagger
 * /api/faqs/{id}:
 *   delete:
 *     summary: Supprimer une FAQ
 *     tags: [FAQ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: FAQ supprimée
 */
router.delete('/:id', (req, res) => faqController.delete(req, res));

/**
 * @swagger
 * /api/faqs/{id}/helpful:
 *   post:
 *     summary: Marquer une FAQ comme utile ou pas
 *     tags: [FAQ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - helpful
 *             properties:
 *               helpful:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Feedback enregistré
 */
router.post('/:id/helpful', (req, res) => faqController.markHelpful(req, res));

export default router;
