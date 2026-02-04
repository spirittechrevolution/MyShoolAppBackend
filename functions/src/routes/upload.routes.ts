/**
 * Routes pour l'upload de fichiers
 */

import express from 'express';
import multer from 'multer';
import { uploadController } from '../controllers/upload.controller';

const router = express.Router();

// Configuration de Multer pour gérer les uploads en mémoire
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max par fichier
    files: 10 // Max 10 fichiers à la fois
  },
  fileFilter: (req, file, cb) => {
    // Accepter uniquement les PDFs
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers PDF sont autorisés'));
    }
  }
});

/**
 * @swagger
 * /upload/course-documents/{courseId}:
 *   post:
 *     summary: Upload de documents PDF pour un cours
 *     tags: [Upload]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du cours
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Fichiers PDF à uploader (max 10MB chacun, max 10 fichiers)
 *     responses:
 *       200:
 *         description: Documents uploadés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     uploadedFiles:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           url:
 *                             type: string
 *                           size:
 *                             type: number
 *                           uploadedAt:
 *                             type: string
 *                             format: date-time
 *                     totalDocuments:
 *                       type: number
 *                 message:
 *                   type: string
 *       400:
 *         description: Aucun fichier fourni
 *       404:
 *         description: Cours non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.post(
  '/course-documents/:courseId',
  upload.array('files', 10),
  uploadController.uploadCourseDocuments.bind(uploadController)
);

/**
 * @swagger
 * /upload/course-documents/{courseId}:
 *   get:
 *     summary: Récupérer les documents d'un cours
 *     tags: [Upload]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du cours
 *     responses:
 *       200:
 *         description: Liste des documents
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     documents:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           url:
 *                             type: string
 *                           size:
 *                             type: number
 *                           uploadedAt:
 *                             type: string
 *                             format: date-time
 *                     count:
 *                       type: number
 *       404:
 *         description: Cours non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get(
  '/course-documents/:courseId',
  uploadController.getCourseDocuments.bind(uploadController)
);

/**
 * @swagger
 * /upload/course-documents/{courseId}:
 *   delete:
 *     summary: Supprimer un document d'un cours
 *     tags: [Upload]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du cours
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               documentUrl:
 *                 type: string
 *                 description: URL du document à supprimer
 *     responses:
 *       200:
 *         description: Document supprimé avec succès
 *       400:
 *         description: URL du document requise
 *       404:
 *         description: Cours non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.delete(
  '/course-documents/:courseId',
  uploadController.deleteCourseDocument.bind(uploadController)
);

/**
 * @swagger
 * /upload/exercise-documents/{exerciseId}:
 *   post:
 *     summary: Upload de documents PDF pour un exercice
 *     tags: [Upload]
 *     parameters:
 *       - in: path
 *         name: exerciseId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'exercice
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Fichiers PDF à uploader (max 10MB chacun, max 10 fichiers)
 *     responses:
 *       200:
 *         description: Documents uploadés avec succès
 *       404:
 *         description: Exercice non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.post(
  '/exercise-documents/:exerciseId',
  upload.array('files', 10),
  uploadController.uploadExerciseDocuments.bind(uploadController)
);

/**
 * @swagger
 * /upload/exercise-documents/{exerciseId}:
 *   get:
 *     summary: Récupérer les documents d'un exercice
 *     tags: [Upload]
 *     parameters:
 *       - in: path
 *         name: exerciseId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'exercice
 *     responses:
 *       200:
 *         description: Liste des documents
 *       404:
 *         description: Exercice non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get(
  '/exercise-documents/:exerciseId',
  uploadController.getExerciseDocuments.bind(uploadController)
);

/**
 * @swagger
 * /upload/exercise-documents/{exerciseId}:
 *   delete:
 *     summary: Supprimer un document d'un exercice
 *     tags: [Upload]
 *     parameters:
 *       - in: path
 *         name: exerciseId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'exercice
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               documentUrl:
 *                 type: string
 *                 description: URL du document à supprimer
 *     responses:
 *       200:
 *         description: Document supprimé avec succès
 *       404:
 *         description: Exercice non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.delete(
  '/exercise-documents/:exerciseId',
  uploadController.deleteExerciseDocument.bind(uploadController)
);

export default router;
