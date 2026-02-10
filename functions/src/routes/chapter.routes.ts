import { Router } from 'express';
import { ChapterController } from '../controllers';

const router = Router();
const chapterController = new ChapterController();

/**
 * @swagger
 * /chapters:
 *   post:
 *     tags: [Chapters]
 *     summary: Créer un nouveau chapitre
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Chapter'
 *     responses:
 *       201:
 *         description: Chapitre créé
 */
router.post('/', (req, res) => chapterController.create(req, res));

/**
 * @swagger
 * /chapters:
 *   get:
 *     tags: [Chapters]
 *     summary: Récupérer tous les chapitres
 *     responses:
 *       200:
 *         description: Liste des chapitres
 */
router.get('/', (req, res) => chapterController.getAll(req, res));

/**
 * @swagger
 * /chapters/{id}:
 *   get:
 *     tags: [Chapters]
 *     summary: Récupérer un chapitre par ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chapitre trouvé
 */
router.get('/:id', (req, res) => chapterController.getById(req, res));

/**
 * @swagger
 * /chapters/course/{courseId}:
 *   get:
 *     tags: [Chapters]
 *     summary: Récupérer les chapitres d'un cours
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des chapitres
 */
router.get('/course/:courseId', (req, res) => chapterController.getByCourseId(req, res));

/**
 * @swagger
 * /chapters/{id}:
 *   put:
 *     tags: [Chapters]
 *     summary: Mettre à jour un chapitre
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
 *             $ref: '#/components/schemas/Chapter'
 *     responses:
 *       200:
 *         description: Chapitre mis à jour
 */
router.put('/:id', (req, res) => chapterController.update(req, res));

/**
 * @swagger
 * /chapters/{id}:
 *   delete:
 *     tags: [Chapters]
 *     summary: Supprimer un chapitre
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chapitre supprimé
 */
router.delete('/:id', (req, res) => chapterController.delete(req, res));

export default router;
