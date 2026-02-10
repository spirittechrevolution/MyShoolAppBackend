import { Router } from 'express';
import { LessonController } from '../controllers';

const router = Router();
const lessonController = new LessonController();

/**
 * @swagger
 * /lessons:
 *   post:
 *     tags: [Lessons]
 *     summary: Créer une nouvelle leçon
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Lesson'
 *     responses:
 *       201:
 *         description: Leçon créée
 */
router.post('/', (req, res) => lessonController.create(req, res));

/**
 * @swagger
 * /lessons:
 *   get:
 *     tags: [Lessons]
 *     summary: Récupérer toutes les leçons
 *     responses:
 *       200:
 *         description: Liste des leçons
 */
router.get('/', (req, res) => lessonController.getAll(req, res));

/**
 * @swagger
 * /lessons/{id}:
 *   get:
 *     tags: [Lessons]
 *     summary: Récupérer une leçon par ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Leçon trouvée
 */
router.get('/:id', (req, res) => lessonController.getById(req, res));

/**
 * @swagger
 * /lessons/course/{courseId}:
 *   get:
 *     tags: [Lessons]
 *     summary: Récupérer les leçons d'un cours
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des leçons
 */
router.get('/course/:courseId', (req, res) => lessonController.getByCourseId(req, res));

/**
 * @swagger
 * /lessons/chapter/{chapterId}:
 *   get:
 *     tags: [Lessons]
 *     summary: Récupérer les leçons d'un chapitre
 *     parameters:
 *       - in: path
 *         name: chapterId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des leçons
 */
router.get('/chapter/:chapterId', (req, res) => lessonController.getByChapterId(req, res));

/**
 * @swagger
 * /lessons/{id}:
 *   put:
 *     tags: [Lessons]
 *     summary: Mettre à jour une leçon
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
 *             $ref: '#/components/schemas/Lesson'
 *     responses:
 *       200:
 *         description: Leçon mise à jour
 */
router.put('/:id', (req, res) => lessonController.update(req, res));

/**
 * @swagger
 * /lessons/{id}:
 *   delete:
 *     tags: [Lessons]
 *     summary: Supprimer une leçon
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Leçon supprimée
 */
router.delete('/:id', (req, res) => lessonController.delete(req, res));

export default router;
