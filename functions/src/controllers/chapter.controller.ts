import { Request, Response } from 'express';
import { ChapterService } from '../services';

const chapterService = new ChapterService();

export class ChapterController {
  async create(req: Request, res: Response): Promise<void> {
    try {
      const chapter = await chapterService.create(req.body);
      res.status(201).json({
        success: true,
        data: chapter,
        message: 'Chapitre créé avec succès'
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
      const chapter = await chapterService.getById(req.params.id);
      if (!chapter) {
        res.status(404).json({
          success: false,
          message: 'Chapitre non trouvé'
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: chapter
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
      const chapters = await chapterService.getAll();
      res.status(200).json({
        success: true,
        data: chapters,
        count: chapters.length
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
      const chapters = await chapterService.getByCourseId(req.params.courseId);
      res.status(200).json({
        success: true,
        data: chapters,
        count: chapters.length
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
      await chapterService.update(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Chapitre mis à jour avec succès'
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
      await chapterService.delete(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Chapitre supprimé avec succès'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}
