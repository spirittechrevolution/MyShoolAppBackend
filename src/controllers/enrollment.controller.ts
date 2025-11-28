import { Request, Response } from 'express';
import { EnrollmentService } from '../services';

const enrollmentService = new EnrollmentService();

export class EnrollmentController {
  async create(req: Request, res: Response): Promise<void> {
    try {
      const enrollment = await enrollmentService.create(req.body);
      res.status(201).json({
        success: true,
        data: enrollment,
        message: 'Inscription créée avec succès'
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
      const enrollment = await enrollmentService.getById(req.params.id);
      if (!enrollment) {
        res.status(404).json({
          success: false,
          message: 'Inscription non trouvée'
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: enrollment
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
      const enrollments = await enrollmentService.getAll();
      res.status(200).json({
        success: true,
        data: enrollments,
        count: enrollments.length
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getByUserId(req: Request, res: Response): Promise<void> {
    try {
      const enrollments = await enrollmentService.getByUserId(req.params.userId);
      res.status(200).json({
        success: true,
        data: enrollments,
        count: enrollments.length
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getByCourseId(req: Request, res: Response): Promise<void> {
    try {
      const enrollments = await enrollmentService.getByCourseId(req.params.courseId);
      res.status(200).json({
        success: true,
        data: enrollments,
        count: enrollments.length
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
      const enrollments = await enrollmentService.getByStatus(req.params.status);
      res.status(200).json({
        success: true,
        data: enrollments,
        count: enrollments.length
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getUserEnrollment(req: Request, res: Response): Promise<void> {
    try {
      const { userId, courseId } = req.params;
      const enrollment = await enrollmentService.getUserEnrollment(userId, courseId);
      if (!enrollment) {
        res.status(404).json({
          success: false,
          message: 'Inscription non trouvée'
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: enrollment
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
      await enrollmentService.update(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Inscription mise à jour avec succès'
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
      await enrollmentService.delete(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Inscription supprimée avec succès'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateProgress(req: Request, res: Response): Promise<void> {
    try {
      const { progress } = req.body;
      await enrollmentService.updateProgress(req.params.id, progress);
      res.status(200).json({
        success: true,
        message: 'Progression mise à jour avec succès'
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
      await enrollmentService.updateStatus(req.params.id, status);
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
}
