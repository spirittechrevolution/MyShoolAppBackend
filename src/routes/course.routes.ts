import { Router } from 'express';
import { CourseController } from '../controllers';

const router = Router();
const courseController = new CourseController();

/**
 * @swagger
 * /api/courses:
 *   post:
 *     tags: [Courses]
 *     summary: Créer un nouveau cours
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Course'
 *     responses:
 *       201:
 *         description: Cours créé avec succès
 */
router.post('/', (req, res) => courseController.create(req, res));

/**
 * @swagger
 * /api/courses:
 *   get:
 *     tags: [Courses]
 *     summary: Récupérer tous les cours
 *     responses:
 *       200:
 *         description: Liste des cours
 */
router.get('/', (req, res) => courseController.getAll(req, res));

/**
 * @swagger
 * /api/courses/published:
 *   get:
 *     tags: [Courses]
 *     summary: Récupérer les cours publiés
 *     responses:
 *       200:
 *         description: Liste des cours publiés
 */
router.get('/published', (req, res) => courseController.getPublished(req, res));

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     tags: [Courses]
 *     summary: Récupérer un cours par ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cours trouvé
 *       404:
 *         description: Cours non trouvé
 */
router.get('/:id', (req, res) => courseController.getById(req, res));

/**
 * @swagger
 * /api/courses/category/{category}:
 *   get:
 *     tags: [Courses]
 *     summary: Récupérer les cours par catégorie
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des cours
 */
router.get('/category/:category', (req, res) => courseController.getByCategory(req, res));

/**
 * @swagger
 * /api/courses/level/{level}:
 *   get:
 *     tags: [Courses]
 *     summary: Récupérer les cours par niveau
 *     parameters:
 *       - in: path
 *         name: level
 *         required: true
 *         schema:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *     responses:
 *       200:
 *         description: Liste des cours
 */
router.get('/level/:level', (req, res) => courseController.getByLevel(req, res));

/**
 * @swagger
 * /api/courses/type/{type}:
 *   get:
 *     tags: [Courses]
 *     summary: Récupérer les cours par type
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des cours
 */
router.get('/type/:type', (req, res) => courseController.getByType(req, res));

/**
 * @swagger
 * /api/courses/{id}:
 *   put:
 *     tags: [Courses]
 *     summary: Mettre à jour un cours
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
 *             $ref: '#/components/schemas/Course'
 *     responses:
 *       200:
 *         description: Cours mis à jour
 */
router.put('/:id', (req, res) => courseController.update(req, res));

/**
 * @swagger
 * /api/courses/{id}:
 *   delete:
 *     tags: [Courses]
 *     summary: Supprimer un cours
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cours supprimé
 */
router.delete('/:id', (req, res) => courseController.delete(req, res));

/**
 * @swagger
 * /api/courses/{id}/publish:
 *   patch:
 *     tags: [Courses]
 *     summary: Publier un cours
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cours publié
 */
router.patch('/:id/publish', (req, res) => courseController.publish(req, res));

/**
 * @swagger
 * /api/courses/{id}/unpublish:
 *   patch:
 *     tags: [Courses]
 *     summary: Dépublier un cours
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cours dépublié
 */
router.patch('/:id/unpublish', (req, res) => courseController.unpublish(req, res));

export default router;
