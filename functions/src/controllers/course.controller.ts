import { Request, Response } from 'express';
import { CourseService } from '../services';

const courseService = new CourseService();

export class CourseController {
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { niveauScolaire, classe, matiereId } = req.body;
      
      // Validation des champs obligatoires
      if (!niveauScolaire || !classe) {
        res.status(400).json({
          success: false,
          message: 'niveauScolaire et classe sont requis'
        });
        return;
      }

      // Pour les niveaux non-élémentaires, matiereId est requis
      if (niveauScolaire !== 'ELEMENTAIRE' && !matiereId) {
        res.status(400).json({
          success: false,
          message: 'matiereId est requis pour les niveaux MOYEN, SECONDAIRE et UNIVERSITAIRE'
        });
        return;
      }

      const course = await courseService.create(req.body);
      res.status(201).json({
        success: true,
        data: course,
        message: 'Cours créé avec succès'
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
      const course = await courseService.getById(req.params.id);
      if (!course) {
        res.status(404).json({
          success: false,
          message: 'Cours non trouvé'
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: course
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
      const courses = await courseService.getAll();
      res.status(200).json({
        success: true,
        data: courses,
        count: courses.length
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getPublished(req: Request, res: Response): Promise<void> {
    try {
      const courses = await courseService.getPublished();
      res.status(200).json({
        success: true,
        data: courses,
        count: courses.length
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getByCategory(req: Request, res: Response): Promise<void> {
    try {
      const courses = await courseService.getByCategory(req.params.category);
      res.status(200).json({
        success: true,
        data: courses,
        count: courses.length,
        message: 'Endpoint deprecated - utilisez /courses/classe/:classe ou /courses/matiere/:matiereId'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Obtenir les cours par classe précise
   * GET /api/courses/classe/:classe
   */
  async getByClasse(req: Request, res: Response): Promise<void> {
    try {
      const { classe } = req.params;
      
      if (!classe) {
        res.status(400).json({
          success: false,
          message: 'Classe requise'
        });
        return;
      }

      const courses = await courseService.getByClasse(decodeURIComponent(classe));
      res.status(200).json({
        success: true,
        data: courses,
        count: courses.length
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Obtenir les cours par matière
   * GET /api/courses/matiere/:matiereId
   */
  async getByMatiere(req: Request, res: Response): Promise<void> {
    try {
      const { matiereId } = req.params;
      
      if (!matiereId) {
        res.status(400).json({
          success: false,
          message: 'ID de matière requis'
        });
        return;
      }

      const courses = await courseService.getByMatiere(matiereId);
      res.status(200).json({
        success: true,
        data: courses,
        count: courses.length
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Obtenir les cours par niveau scolaire
   * GET /api/courses/niveau/:niveau
   */
  async getByNiveauScolaire(req: Request, res: Response): Promise<void> {
    try {
      const { niveau } = req.params;
      
      if (!niveau) {
        res.status(400).json({
          success: false,
          message: 'Niveau scolaire requis'
        });
        return;
      }

      const courses = await courseService.getByNiveauScolaire(niveau as any);
      res.status(200).json({
        success: true,
        data: courses,
        count: courses.length
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getByLevel(req: Request, res: Response): Promise<void> {
    try {
      const courses = await courseService.getByLevel(req.params.level);
      res.status(200).json({
        success: true,
        data: courses,
        count: courses.length
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getByType(req: Request, res: Response): Promise<void> {
    try {
      const courses = await courseService.getByType(req.params.type);
      res.status(200).json({
        success: true,
        data: courses,
        count: courses.length
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
      await courseService.update(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Cours mis à jour avec succès'
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
      await courseService.delete(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Cours supprimé avec succès'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async publish(req: Request, res: Response): Promise<void> {
    try {
      await courseService.publish(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Cours publié avec succès'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async unpublish(req: Request, res: Response): Promise<void> {
    try {
      await courseService.unpublish(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Cours dépublié avec succès'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async getByInstructor(req: Request, res: Response): Promise<void> {
    try {
      const courses = await courseService.getByInstructor(req.params.instructorId);
      res.status(200).json({
        success: true,
        data: courses,
        count: courses.length
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}
