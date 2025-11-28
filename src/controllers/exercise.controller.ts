import { Request, Response } from 'express';
import { ExerciseService } from '../services';

const exerciseService = new ExerciseService();

export class ExerciseController {
  async create(req: Request, res: Response): Promise<void> {
    try {
      const exercise = await exerciseService.create(req.body);
      res.status(201).json({
        success: true,
        data: exercise,
        message: 'Exercice créé avec succès'
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
      const exercise = await exerciseService.getById(req.params.id);
      if (!exercise) {
        res.status(404).json({
          success: false,
          message: 'Exercice non trouvé'
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: exercise
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
      const exercises = await exerciseService.getAll();
      res.status(200).json({
        success: true,
        data: exercises,
        count: exercises.length
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
      const exercises = await exerciseService.getByCourseId(req.params.courseId);
      res.status(200).json({
        success: true,
        data: exercises,
        count: exercises.length
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
      const exercises = await exerciseService.getByChapterId(req.params.chapterId);
      res.status(200).json({
        success: true,
        data: exercises,
        count: exercises.length
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
      const exercises = await exerciseService.getByType(req.params.type as 'qcm' | 'code');
      res.status(200).json({
        success: true,
        data: exercises,
        count: exercises.length
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getByDifficulty(req: Request, res: Response): Promise<void> {
    try {
      const exercises = await exerciseService.getByDifficulty(req.params.difficulty);
      res.status(200).json({
        success: true,
        data: exercises,
        count: exercises.length
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
      await exerciseService.update(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Exercice mis à jour avec succès'
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
      await exerciseService.delete(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Exercice supprimé avec succès'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}
