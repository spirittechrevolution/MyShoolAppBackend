import { Request, Response } from 'express';
import { InstructorService } from '../services';

const instructorService = new InstructorService();

export class InstructorController {
  async create(req: Request, res: Response): Promise<void> {
    try {
      const instructor = await instructorService.create(req.body);
      res.status(201).json({
        success: true,
        data: instructor,
        message: 'Instructeur créé avec succès'
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
      const instructor = await instructorService.getById(req.params.id);
      if (!instructor) {
        res.status(404).json({
          success: false,
          message: 'Instructeur non trouvé'
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: instructor
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
      const instructors = await instructorService.getAll();
      res.status(200).json({
        success: true,
        data: instructors,
        count: instructors.length
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getByCourse(req: Request, res: Response): Promise<void> {
    try {
      const instructors = await instructorService.getByCourse(req.params.courseId);
      res.status(200).json({
        success: true,
        data: instructors,
        count: instructors.length
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getByExpertise(req: Request, res: Response): Promise<void> {
    try {
      const instructors = await instructorService.getByExpertise(req.params.expertiseId);
      res.status(200).json({
        success: true,
        data: instructors,
        count: instructors.length
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
      await instructorService.update(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Instructeur mis à jour avec succès'
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
      await instructorService.delete(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Instructeur supprimé avec succès'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}
