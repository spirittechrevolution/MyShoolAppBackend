import { Router } from 'express';
import { MatiereController } from '../controllers/matiere.controller';

const router = Router();
const matiereController = new MatiereController();

/**
 * @swagger
 * /matieres:
 *   get:
 *     tags: [Matieres]
 *     summary: Récupérer toutes les matières actives
 *     responses:
 *       200:
 *         description: Liste de toutes les matières actives
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
 *                     $ref: '#/components/schemas/Matiere'
 */
router.get('/', matiereController.getAll.bind(matiereController));

/**
 * @swagger
 * /matieres/niveau/{niveau}:
 *   get:
 *     tags: [Matieres]
 *     summary: Récupérer les matières par niveau scolaire
 *     parameters:
 *       - in: path
 *         name: niveau
 *         required: true
 *         schema:
 *           type: string
 *           enum: [ELEMENTAIRE, MOYEN, SECONDAIRE, UNIVERSITAIRE]
 *     responses:
 *       200:
 *         description: Liste des matières pour ce niveau
 */
router.get('/niveau/:niveau', matiereController.getByNiveau.bind(matiereController));

/**
 * @swagger
 * /matieres/classe/{classe}:
 *   get:
 *     tags: [Matieres]
 *     summary: Récupérer les matières par classe précise
 *     parameters:
 *       - in: path
 *         name: classe
 *         required: true
 *         schema:
 *           type: string
 *         example: 3ème (BFEM)
 *     responses:
 *       200:
 *         description: Liste des matières pour cette classe
 */
router.get('/classe/:classe', matiereController.getByClasse.bind(matiereController));

/**
 * @swagger
 * /matieres/{id}:
 *   get:
 *     tags: [Matieres]
 *     summary: Récupérer une matière par ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails de la matière
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Matiere'
 *       404:
 *         description: Matière non trouvée
 */
router.get('/:id', matiereController.getById.bind(matiereController));

/**
 * @swagger
 * /matieres:
 *   post:
 *     tags: [Matieres]
 *     summary: Créer une nouvelle matière (Admin uniquement)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nom, classe, niveauScolaire]
 *             properties:
 *               nom:
 *                 type: string
 *                 example: Mathématiques
 *               description:
 *                 type: string
 *                 example: Matière scientifique fondamentale
 *               classe:
 *                 type: string
 *                 example: 3ème (BFEM)
 *               niveauScolaire:
 *                 type: string
 *                 enum: [ELEMENTAIRE, MOYEN, SECONDAIRE, UNIVERSITAIRE]
 *               icon:
 *                 type: string
 *                 example: 🔢
 *               color:
 *                 type: string
 *                 example: '#4CAF50'
 *               ordre:
 *                 type: number
 *                 example: 1
 *     responses:
 *       201:
 *         description: Matière créée avec succès
 *       400:
 *         description: Données invalides
 */
router.post('/', matiereController.create.bind(matiereController));

/**
 * @swagger
 * /matieres/{id}:
 *   put:
 *     tags: [Matieres]
 *     summary: Mettre à jour une matière (Admin uniquement)
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
 *             properties:
 *               nom:
 *                 type: string
 *               description:
 *                 type: string
 *               icon:
 *                 type: string
 *               color:
 *                 type: string
 *               ordre:
 *                 type: number
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Matière mise à jour
 *       404:
 *         description: Matière non trouvée
 */
router.put('/:id', matiereController.update.bind(matiereController));

/**
 * @swagger
 * /matieres/{id}:
 *   delete:
 *     tags: [Matieres]
 *     summary: Supprimer une matière (soft delete, Admin uniquement)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Matière désactivée
 *       404:
 *         description: Matière non trouvée
 */
router.delete('/:id', matiereController.delete.bind(matiereController));

export default router;
