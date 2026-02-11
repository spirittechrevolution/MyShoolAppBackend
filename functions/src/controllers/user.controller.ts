import { Request, Response } from 'express';
import { UserService } from '../services';
import { CLASSES_PAR_NIVEAU } from '../models/matiere.model';

const userService = new UserService();

export class UserController {
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { niveauScolaire, classe } = req.body;
      
      // Validation des champs obligatoires
      if (!niveauScolaire || !classe) {
        res.status(400).json({
          success: false,
          message: 'niveauScolaire et classe sont obligatoires lors de l\'inscription'
        });
        return;
      }

      // Vérifier que la classe appartient bien au niveau
      const classesDisponibles = CLASSES_PAR_NIVEAU[niveauScolaire as keyof typeof CLASSES_PAR_NIVEAU];
      if (!classesDisponibles || !classesDisponibles.includes(classe)) {
        res.status(400).json({
          success: false,
          message: `La classe "${classe}" n'existe pas pour le niveau "${niveauScolaire}"`,
          data: {
            classesDisponibles: classesDisponibles || []
          }
        });
        return;
      }

      const user = await userService.create(req.body);
      res.status(201).json({
        success: true,
        data: user,
        message: 'Utilisateur créé avec succès'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const user = await userService.getById(req.params.id);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Utilisateur non trouvé'
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const users = await userService.getAll();
      res.status(200).json({
        success: true,
        data: users,
        count: users.length
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getByEmail(req: Request, res: Response): Promise<void> {
    try {
      const user = await userService.getByEmail(req.params.email);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Utilisateur non trouvé'
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getByPhone(req: Request, res: Response): Promise<void> {
    try {
      const user = await userService.getByPhone(req.params.phone);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Utilisateur non trouvé'
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getByRole(req: Request, res: Response): Promise<void> {
    try {
      const users = await userService.getByRole(req.params.role);
      res.status(200).json({
        success: true,
        data: users,
        count: users.length
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getByStatus(req: Request, res: Response): Promise<void> {
    try {
      const users = await userService.getByStatus(req.params.status);
      res.status(200).json({
        success: true,
        data: users,
        count: users.length
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      await userService.update(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Utilisateur mis à jour avec succès'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      await userService.delete(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Utilisateur supprimé avec succès'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateProfileImage(req: Request, res: Response): Promise<void> {
    try {
      const { profileImageBase64 } = req.body;
      await userService.updateProfileImage(req.params.id, profileImageBase64);
      res.status(200).json({
        success: true,
        message: 'Image de profil mise à jour avec succès'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { status } = req.body;
      await userService.updateStatus(req.params.id, status);
      res.status(200).json({
        success: true,
        message: 'Statut mis à jour avec succès'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Obtenir les classes disponibles par niveau
   * GET /api/users/classes-disponibles
   */
  async getAvailableClasses(req: Request, res: Response): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        data: CLASSES_PAR_NIVEAU
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Obtenir les classes pour un niveau spécifique
   * GET /api/users/classes-disponibles/:niveau
   */
  async getClassesByNiveau(req: Request, res: Response): Promise<void> {
    try {
      const { niveau } = req.params;
      const classes = CLASSES_PAR_NIVEAU[niveau as keyof typeof CLASSES_PAR_NIVEAU];

      if (!classes) {
        res.status(404).json({
          success: false,
          message: `Niveau "${niveau}" non trouvé`,
          data: {
            niveauxDisponibles: Object.keys(CLASSES_PAR_NIVEAU)
          }
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          niveau,
          classes
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}
