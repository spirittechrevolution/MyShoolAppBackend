import { Router } from 'express';
import { ExerciseController } from '../controllers';

const router = Router();
const exerciseController = new ExerciseController();

/**
 * @swagger
 * /exercises:
 *   post:
 *     tags: [Exercises]
 *     summary: Créer un nouvel exercice
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Exercise'
 *     responses:
 *       201:
 *         description: Exercice créé
 */
router.post('/', (req, res) => exerciseController.create(req, res));

/**
 * @swagger
 * /exercises:
 *   get:
 *     tags: [Exercises]
 *     summary: Récupérer tous les exercices
 *     responses:
 *       200:
 *         description: Liste des exercices
 */
router.get('/', (req, res) => exerciseController.getAll(req, res));

/**
 * @swagger
 * /exercises/{id}:
 *   get:
 *     tags: [Exercises]
 *     summary: Récupérer un exercice par ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Exercice trouvé
 */
router.get('/:id', (req, res) => exerciseController.getById(req, res));

/**
 * @swagger
 * /exercises/course/{courseId}:
 *   get:
 *     tags: [Exercises]
 *     summary: Récupérer les exercices d'un cours
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des exercices
 */
router.get('/course/:courseId', (req, res) => exerciseController.getByCourseId(req, res));

/**
 * @swagger
 * /exercises/chapter/{chapterId}:
 *   get:
 *     tags: [Exercises]
 *     summary: Récupérer les exercices d'un chapitre
 *     parameters:
 *       - in: path
 *         name: chapterId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des exercices
 */
router.get('/chapter/:chapterId', (req, res) => exerciseController.getByChapterId(req, res));

/**
 * @swagger
 * /exercises/type/{type}:
 *   get:
 *     tags: [Exercises]
 *     summary: Récupérer les exercices par type
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [quiz, coding, essay]
 *     responses:
 *       200:
 *         description: Liste des exercices
 */
router.get('/type/:type', (req, res) => exerciseController.getByType(req, res));

/**
 * @swagger
 * /exercises/difficulty/{difficulty}:
 *   get:
 *     tags: [Exercises]
 *     summary: Récupérer les exercices par difficulté
 *     parameters:
 *       - in: path
 *         name: difficulty
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des exercices
 */
router.get('/difficulty/:difficulty', (req, res) => exerciseController.getByDifficulty(req, res));

/**
 * @swagger
 * /exercises/{id}:
 *   put:
 *     tags: [Exercises]
 *     summary: Mettre à jour un exercice
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
 *             $ref: '#/components/schemas/Exercise'
 *     responses:
 *       200:
 *         description: Exercice mis à jour
 */
router.put('/:id', (req, res) => exerciseController.update(req, res));

/**
 * @swagger
 * /exercises/{id}:
 *   delete:
 *     tags: [Exercises]
 *     summary: Supprimer un exercice
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Exercice supprimé
 */
router.delete('/:id', (req, res) => exerciseController.delete(req, res));

export default router;
