import { Request, Response } from 'express';
import { LessonService } from '../services';

const lessonService = new LessonService();

export class LessonController {
  async create(req: Request, res: Response): Promise<void> {
    try {
      const lesson = await lessonService.create(req.body);
      res.status(201).json({
        success: true,
        data: lesson,
        message: 'Leçon créée avec succès'
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
      const lesson = await lessonService.getById(req.params.id);
      if (!lesson) {
        res.status(404).json({
          success: false,
          message: 'Leçon non trouvée'
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: lesson
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
      const lessons = await lessonService.getAll();
      res.status(200).json({
        success: true,
        data: lessons,
        count: lessons.length
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
      const lessons = await lessonService.getByCourseId(req.params.courseId);
      res.status(200).json({
        success: true,
        data: lessons,
        count: lessons.length
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getByChapterId(req: Request, res: Response): Promise<void> {
    try {
      const lessons = await lessonService.getByChapterId(req.params.chapterId);
      res.status(200).json({
        success: true,
        data: lessons,
        count: lessons.length
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
      await lessonService.update(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Leçon mise à jour avec succès'
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
      await lessonService.delete(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Leçon supprimée avec succès'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}
