import { Router } from 'express';
import { InstructorController } from '../controllers';

const router = Router();
const instructorController = new InstructorController();

/**
 * @swagger
 * /instructors:
 *   post:
 *     tags: [Instructors]
 *     summary: Créer un nouvel instructeur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Instructor'
 *     responses:
 *       201:
 *         description: Instructeur créé
 */
router.post('/', (req, res) => instructorController.create(req, res));

/**
 * @swagger
 * /instructors:
 *   get:
 *     tags: [Instructors]
 *     summary: Récupérer tous les instructeurs
 *     responses:
 *       200:
 *         description: Liste des instructeurs
 */
router.get('/', (req, res) => instructorController.getAll(req, res));

/**
 * @swagger
 * /instructors/{id}:
 *   get:
 *     tags: [Instructors]
 *     summary: Récupérer un instructeur par ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Instructeur trouvé
 */
router.get('/:id', (req, res) => instructorController.getById(req, res));

/**
 * @swagger
 * /instructors/course/{courseId}:
 *   get:
 *     tags: [Instructors]
 *     summary: Récupérer les instructeurs d'un cours
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des instructeurs
 */
router.get('/course/:courseId', (req, res) => instructorController.getByCourse(req, res));

/**
 * @swagger
 * /instructors/expertise/{expertiseId}:
 *   get:
 *     tags: [Instructors]
 *     summary: Récupérer les instructeurs par expertise
 *     parameters:
 *       - in: path
 *         name: expertiseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des instructeurs
 */
router.get('/expertise/:expertiseId', (req, res) => instructorController.getByExpertise(req, res));

/**
 * @swagger
 * /instructors/{id}:
 *   put:
 *     tags: [Instructors]
 *     summary: Mettre à jour un instructeur
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
 *             $ref: '#/components/schemas/Instructor'
 *     responses:
 *       200:
 *         description: Instructeur mis à jour
 */
router.put('/:id', (req, res) => instructorController.update(req, res));

/**
 * @swagger
 * /instructors/{id}:
 *   delete:
 *     tags: [Instructors]
 *     summary: Supprimer un instructeur
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Instructeur supprimé
 */
router.delete('/:id', (req, res) => instructorController.delete(req, res));

export default router;
