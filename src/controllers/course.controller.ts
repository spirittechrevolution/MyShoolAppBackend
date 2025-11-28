import { Request, Response } from 'express';
import { CourseService } from '../services';

const courseService = new CourseService();

export class CourseController {
  async create(req: Request, res: Response): Promise<void> {
    try {
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
}
