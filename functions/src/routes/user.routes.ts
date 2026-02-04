import { Router } from 'express';
import { UserController } from '../controllers';

const router = Router();
const userController = new UserController();

/**
 * @swagger
 * /api/users:
 *   post:
 *     tags: [Users]
 *     summary: Créer un nouvel utilisateur
 *     description: Crée un utilisateur avec authentification Firebase automatique
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Erreur de validation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', (req, res) => userController.create(req, res));

/**
 * @swagger
 * /api/users/classes-disponibles:
 *   get:
 *     tags: [Users]
 *     summary: Obtenir toutes les classes disponibles par niveau
 *     responses:
 *       200:
 *         description: Liste des classes par niveau scolaire
 */
router.get('/classes-disponibles', (req, res) => userController.getAvailableClasses(req, res));

/**
 * @swagger
 * /api/users/classes-disponibles/{niveau}:
 *   get:
 *     tags: [Users]
 *     summary: Obtenir les classes pour un niveau spécifique
 *     parameters:
 *       - in: path
 *         name: niveau
 *         required: true
 *         schema:
 *           type: string
 *           enum: [ELEMENTAIRE, MOYEN, SECONDAIRE, UNIVERSITAIRE]
 *     responses:
 *       200:
 *         description: Liste des classes pour ce niveau
 */
router.get('/classes-disponibles/:niveau', (req, res) => userController.getClassesByNiveau(req, res));

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: Récupérer tous les utilisateurs
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
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
 *                     $ref: '#/components/schemas/User'
 *                 count:
 *                   type: number
 */
router.get('/', (req, res) => userController.getAll(req, res));

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Récupérer un utilisateur par ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du document Firestore
 *     responses:
 *       200:
 *         description: Utilisateur trouvé
 *       404:
 *         description: Utilisateur non trouvé
 */
router.get('/:id', (req, res) => userController.getById(req, res));

/**
 * @swagger
 * /api/users/email/{email}:
 *   get:
 *     tags: [Users]
 *     summary: Récupérer un utilisateur par email
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Utilisateur trouvé
 *       404:
 *         description: Utilisateur non trouvé
 */
router.get('/email/:email', (req, res) => userController.getByEmail(req, res));

/**
 * @swagger
 * /api/users/phone/{phone}:
 *   get:
 *     tags: [Users]
 *     summary: Récupérer un utilisateur par téléphone
 *     parameters:
 *       - in: path
 *         name: phone
 *         required: true
 *         schema:
 *           type: string
 *         example: "+221771234567"
 *     responses:
 *       200:
 *         description: Utilisateur trouvé
 *       404:
 *         description: Utilisateur non trouvé
 */
router.get('/phone/:phone', (req, res) => userController.getByPhone(req, res));

/**
 * @swagger
 * /api/users/role/{role}:
 *   get:
 *     tags: [Users]
 *     summary: Récupérer les utilisateurs par rôle
 *     parameters:
 *       - in: path
 *         name: role
 *         required: true
 *         schema:
 *           type: string
 *           enum: [student, instructor, admin]
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 */
router.get('/role/:role', (req, res) => userController.getByRole(req, res));

/**
 * @swagger
 * /api/users/status/{status}:
 *   get:
 *     tags: [Users]
 *     summary: Récupérer les utilisateurs par statut
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [active, inactive, suspended]
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 */
router.get('/status/:status', (req, res) => userController.getByStatus(req, res));

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     tags: [Users]
 *     summary: Mettre à jour un utilisateur
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
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour
 *       400:
 *         description: Erreur de validation
 */
router.put('/:id', (req, res) => userController.update(req, res));

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Supprimer un utilisateur
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Utilisateur supprimé
 *       500:
 *         description: Erreur serveur
 */
router.delete('/:id', (req, res) => userController.delete(req, res));

/**
 * @swagger
 * /api/users/{id}/profile-image:
 *   patch:
 *     tags: [Users]
 *     summary: Mettre à jour l'image de profil
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
 *               profileImageBase64:
 *                 type: string
 *                 description: Image en base64
 *     responses:
 *       200:
 *         description: Image mise à jour
 */
router.patch('/:id/profile-image', (req, res) => userController.updateProfileImage(req, res));

/**
 * @swagger
 * /api/users/{id}/status:
 *   patch:
 *     tags: [Users]
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
 *                 enum: [active, inactive, suspended]
 *     responses:
 *       200:
 *         description: Statut mis à jour
 */
router.patch('/:id/status', (req, res) => userController.updateStatus(req, res));

export default router;
