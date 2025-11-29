import { Router } from 'express';
import { EnrollmentController } from '../controllers';

const router = Router();
const enrollmentController = new EnrollmentController();

/**
 * @swagger
 * /api/enrollments:
 *   post:
 *     tags: [Enrollments]
 *     summary: Créer une nouvelle inscription
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Enrollment'
 *     responses:
 *       201:
 *         description: Inscription créée avec succès
 */
router.post('/', (req, res) => enrollmentController.create(req, res));

/**
 * @swagger
 * /api/enrollments:
 *   get:
 *     tags: [Enrollments]
 *     summary: Récupérer toutes les inscriptions
 *     responses:
 *       200:
 *         description: Liste des inscriptions
 */
router.get('/', (req, res) => enrollmentController.getAll(req, res));

/**
 * @swagger
 * /api/enrollments/{id}:
 *   get:
 *     tags: [Enrollments]
 *     summary: Récupérer une inscription par ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Inscription trouvée
 */
router.get('/:id', (req, res) => enrollmentController.getById(req, res));

/**
 * @swagger
 * /api/enrollments/user/{userId}:
 *   get:
 *     tags: [Enrollments]
 *     summary: Récupérer les inscriptions d'un utilisateur
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des inscriptions
 */
router.get('/user/:userId', (req, res) => enrollmentController.getByUserId(req, res));

/**
 * @swagger
 * /api/enrollments/course/{courseId}:
 *   get:
 *     tags: [Enrollments]
 *     summary: Récupérer les inscriptions d'un cours
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des inscriptions
 */
router.get('/course/:courseId', (req, res) => enrollmentController.getByCourseId(req, res));

/**
 * @swagger
 * /api/enrollments/status/{status}:
 *   get:
 *     tags: [Enrollments]
 *     summary: Récupérer les inscriptions par statut
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [active, completed, cancelled]
 *     responses:
 *       200:
 *         description: Liste des inscriptions
 */
router.get('/status/:status', (req, res) => enrollmentController.getByStatus(req, res));

/**
 * @swagger
 * /api/enrollments/user/{userId}/course/{courseId}:
 *   get:
 *     tags: [Enrollments]
 *     summary: Récupérer l'inscription d'un utilisateur à un cours
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Inscription trouvée
 */
router.get('/user/:userId/course/:courseId', (req, res) => enrollmentController.getUserEnrollment(req, res));

/**
 * @swagger
 * /api/enrollments/{id}:
 *   put:
 *     tags: [Enrollments]
 *     summary: Mettre à jour une inscription
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
 *             $ref: '#/components/schemas/Enrollment'
 *     responses:
 *       200:
 *         description: Inscription mise à jour
 */
router.put('/:id', (req, res) => enrollmentController.update(req, res));

/**
 * @swagger
 * /api/enrollments/{id}:
 *   delete:
 *     tags: [Enrollments]
 *     summary: Supprimer une inscription
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Inscription supprimée
 */
router.delete('/:id', (req, res) => enrollmentController.delete(req, res));

/**
 * @swagger
 * /api/enrollments/{id}/progress:
 *   patch:
 *     tags: [Enrollments]
 *     summary: Mettre à jour la progression
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
 *               progress:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *     responses:
 *       200:
 *         description: Progression mise à jour
 */
router.patch('/:id/progress', (req, res) => enrollmentController.updateProgress(req, res));

/**
 * @swagger
 * /api/enrollments/{id}/status:
 *   patch:
 *     tags: [Enrollments]
 *     summary: Mettre à jour le statut
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
 *               status:
 *                 type: string
 *                 enum: [active, completed, cancelled]
 *     responses:
 *       200:
 *         description: Statut mis à jour
 */
router.patch('/:id/status', (req, res) => enrollmentController.updateStatus(req, res));

export default router;
