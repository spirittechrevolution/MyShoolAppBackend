import { Router } from 'express';
import { MatiereController } from '../controllers/matiere.controller';

const router = Router();
const matiereController = new MatiereController();

/**
 * @route GET /api/matieres
 * @desc Récupérer toutes les matières actives
 */
router.get('/', matiereController.getAll.bind(matiereController));

/**
 * @route GET /api/matieres/niveau/:niveau
 * @desc Récupérer les matières par niveau scolaire
 */
router.get('/niveau/:niveau', matiereController.getByNiveau.bind(matiereController));

/**
 * @route GET /api/matieres/classe/:classe
 * @desc Récupérer les matières par classe précise
 */
router.get('/classe/:classe', matiereController.getByClasse.bind(matiereController));

/**
 * @route GET /api/matieres/:id
 * @desc Récupérer une matière par ID
 */
router.get('/:id', matiereController.getById.bind(matiereController));

/**
 * @route POST /api/matieres
 * @desc Créer une nouvelle matière (Admin uniquement)
 */
router.post('/', matiereController.create.bind(matiereController));

/**
 * @route PUT /api/matieres/:id
 * @desc Mettre à jour une matière (Admin uniquement)
 */
router.put('/:id', matiereController.update.bind(matiereController));

/**
 * @route DELETE /api/matieres/:id
 * @desc Supprimer une matière (soft delete, Admin uniquement)
 */
router.delete('/:id', matiereController.delete.bind(matiereController));

export default router;
