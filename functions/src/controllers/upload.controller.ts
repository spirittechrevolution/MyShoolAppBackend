/**
 * Contrôleur pour la gestion des uploads de fichiers
 */

import { Request, Response } from 'express';
import { storageService } from '../services/storage.service';
import { CourseService } from '../services/course.service';
import { ExerciseService } from '../services/exercise.service';

export class UploadController {
  private courseService = new CourseService();
  private exerciseService = new ExerciseService();

  /**
   * Upload de documents PDF pour un cours
   * @route POST /api/upload/course-documents/:courseId
   */
  async uploadCourseDocuments(req: Request, res: Response): Promise<void> {
    try {
      const { courseId } = req.params;

      // Vérifier que le cours existe
      const course = await this.courseService.getById(courseId);
      if (!course) {
        res.status(404).json({
          success: false,
          message: 'Cours non trouvé'
        });
        return;
      }

      // Vérifier qu'il y a des fichiers
      if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
        res.status(400).json({
          success: false,
          message: 'Aucun fichier fourni'
        });
        return;
      }

      // Préparer les fichiers pour l'upload
      const files = Array.isArray(req.files) ? req.files : [req.files];
      const filesToUpload = files.map((file: any) => ({
        buffer: file.buffer,
        originalName: file.originalname
      }));

      // Upload vers Firebase Storage
      const uploadedFiles = await storageService.uploadMultipleFiles(
        filesToUpload,
        `courses/${courseId}/documents`,
        ['application/pdf'], // Seulement les PDFs
        10 // Max 10MB par fichier
      );

      // Récupérer les documents existants du cours
      const existingDocuments = course.documents || [];

      // Ajouter les nouveaux documents
      const updatedDocuments = [
        ...existingDocuments,
        ...uploadedFiles
      ];

      // Mettre à jour le cours avec les nouveaux documents
      await this.courseService.update(courseId, {
        documents: updatedDocuments
      });

      res.status(200).json({
        success: true,
        data: {
          uploadedFiles: uploadedFiles,
          totalDocuments: updatedDocuments.length
        },
        message: `${uploadedFiles.length} document(s) uploadé(s) avec succès`
      });

    } catch (error: any) {
      console.error('❌ Erreur upload documents cours:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de l\'upload des documents'
      });
    }
  }

  /**
   * Supprimer un document d'un cours
   * @route DELETE /api/upload/course-documents/:courseId/:documentUrl
   */
  async deleteCourseDocument(req: Request, res: Response): Promise<void> {
    try {
      const { courseId } = req.params;
      const { documentUrl } = req.body;

      if (!documentUrl) {
        res.status(400).json({
          success: false,
          message: 'URL du document requise'
        });
        return;
      }

      // Vérifier que le cours existe
      const course = await this.courseService.getById(courseId);
      if (!course) {
        res.status(404).json({
          success: false,
          message: 'Cours non trouvé'
        });
        return;
      }

      // Supprimer le fichier de Storage
      await storageService.deleteFile(documentUrl);

      // Retirer le document de la liste
      const updatedDocuments = (course.documents || []).filter(
        doc => doc.url !== documentUrl
      );

      // Mettre à jour le cours
      await this.courseService.update(courseId, {
        documents: updatedDocuments
      });

      res.status(200).json({
        success: true,
        message: 'Document supprimé avec succès'
      });

    } catch (error: any) {
      console.error('❌ Erreur suppression document:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la suppression du document'
      });
    }
  }

  /**
   * Récupérer les documents d'un cours
   * @route GET /api/upload/course-documents/:courseId
   */
  async getCourseDocuments(req: Request, res: Response): Promise<void> {
    try {
      const { courseId } = req.params;

      const course = await this.courseService.getById(courseId);
      if (!course) {
        res.status(404).json({
          success: false,
          message: 'Cours non trouvé'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          documents: course.documents || [],
          count: (course.documents || []).length
        }
      });

    } catch (error: any) {
      console.error('❌ Erreur récupération documents:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des documents'
      });
    }
  }

  /**
   * Upload de documents PDF pour un exercice
   * @route POST /api/upload/exercise-documents/:exerciseId
   */
  async uploadExerciseDocuments(req: Request, res: Response): Promise<void> {
    try {
      const { exerciseId } = req.params;

      // Vérifier que l'exercice existe
      const exercise = await this.exerciseService.getById(exerciseId);
      if (!exercise) {
        res.status(404).json({
          success: false,
          message: 'Exercice non trouvé'
        });
        return;
      }

      // Vérifier qu'il y a des fichiers
      if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
        res.status(400).json({
          success: false,
          message: 'Aucun fichier fourni'
        });
        return;
      }

      // Préparer les fichiers pour l'upload
      const files = Array.isArray(req.files) ? req.files : [req.files];
      const filesToUpload = files.map((file: any) => ({
        buffer: file.buffer,
        originalName: file.originalname
      }));

      // Upload vers Firebase Storage
      const uploadedFiles = await storageService.uploadMultipleFiles(
        filesToUpload,
        `exercises/${exerciseId}/documents`,
        ['application/pdf'],
        10
      );

      // Récupérer les documents existants
      const existingDocuments = exercise.documents || [];

      // Ajouter les nouveaux documents
      const updatedDocuments = [
        ...existingDocuments,
        ...uploadedFiles
      ];

      // Mettre à jour l'exercice
      await this.exerciseService.update(exerciseId, {
        documents: updatedDocuments
      });

      res.status(200).json({
        success: true,
        data: {
          uploadedFiles: uploadedFiles,
          totalDocuments: updatedDocuments.length
        },
        message: `${uploadedFiles.length} document(s) uploadé(s) avec succès`
      });

    } catch (error: any) {
      console.error('❌ Erreur upload documents exercice:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de l\'upload des documents'
      });
    }
  }

  /**
   * Supprimer un document d'un exercice
   * @route DELETE /api/upload/exercise-documents/:exerciseId
   */
  async deleteExerciseDocument(req: Request, res: Response): Promise<void> {
    try {
      const { exerciseId } = req.params;
      const { documentUrl } = req.body;

      if (!documentUrl) {
        res.status(400).json({
          success: false,
          message: 'URL du document requise'
        });
        return;
      }

      // Vérifier que l'exercice existe
      const exercise = await this.exerciseService.getById(exerciseId);
      if (!exercise) {
        res.status(404).json({
          success: false,
          message: 'Exercice non trouvé'
        });
        return;
      }

      // Supprimer le fichier de Storage
      await storageService.deleteFile(documentUrl);

      // Retirer le document de la liste
      const updatedDocuments = (exercise.documents || []).filter(
        doc => doc.url !== documentUrl
      );

      // Mettre à jour l'exercice
      await this.exerciseService.update(exerciseId, {
        documents: updatedDocuments
      });

      res.status(200).json({
        success: true,
        message: 'Document supprimé avec succès'
      });

    } catch (error: any) {
      console.error('❌ Erreur suppression document exercice:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la suppression du document'
      });
    }
  }

  /**
   * Récupérer les documents d'un exercice
   * @route GET /api/upload/exercise-documents/:exerciseId
   */
  async getExerciseDocuments(req: Request, res: Response): Promise<void> {
    try {
      const { exerciseId } = req.params;

      const exercise = await this.exerciseService.getById(exerciseId);
      if (!exercise) {
        res.status(404).json({
          success: false,
          message: 'Exercice non trouvé'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          documents: exercise.documents || [],
          count: (exercise.documents || []).length
        }
      });

    } catch (error: any) {
      console.error('❌ Erreur récupération documents exercice:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des documents'
      });
    }
  }
}

export const uploadController = new UploadController();
