/**
 * Service de gestion du stockage Firebase Storage
 * Pour l'upload de fichiers (PDFs, images, etc.)
 */

import * as admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';

export interface UploadedFile {
  name: string;
  url: string;
  size: number;
  uploadedAt: Date;
}

export class StorageService {
  private bucket = admin.storage().bucket();

  /**
   * Upload un fichier vers Firebase Storage
   * @param file Buffer du fichier
   * @param originalName Nom original du fichier
   * @param folder Dossier de destination (ex: 'courses/documents')
   * @param allowedTypes Types MIME autorisés (ex: ['application/pdf'])
   * @param maxSizeMB Taille maximale en MB
   */
  async uploadFile(
    file: Buffer,
    originalName: string,
    folder: string = 'uploads',
    allowedTypes: string[] = ['application/pdf'],
    maxSizeMB: number = 10
  ): Promise<UploadedFile> {
    try {
      // Validation de la taille
      const fileSizeInMB = file.length / (1024 * 1024);
      if (fileSizeInMB > maxSizeMB) {
        throw new Error(`Le fichier dépasse la taille maximale de ${maxSizeMB}MB`);
      }

      // Détection du type MIME
      const mimeType = this.getMimeType(originalName);
      if (!allowedTypes.includes(mimeType)) {
        throw new Error(`Type de fichier non autorisé. Types acceptés: ${allowedTypes.join(', ')}`);
      }

      // Génération d'un nom unique
      const uniqueId = uuidv4();
      const extension = this.getFileExtension(originalName);
      const fileName = `${uniqueId}${extension}`;
      const filePath = `${folder}/${fileName}`;

      // Upload vers Firebase Storage
      const fileUpload = this.bucket.file(filePath);
      
      await fileUpload.save(file, {
        metadata: {
          contentType: mimeType,
          metadata: {
            originalName: originalName,
            uploadedAt: new Date().toISOString()
          }
        }
      });

      // Rendre le fichier public
      await fileUpload.makePublic();

      // Récupérer l'URL publique
      const publicUrl = `https://storage.googleapis.com/${this.bucket.name}/${filePath}`;

      return {
        name: originalName,
        url: publicUrl,
        size: file.length,
        uploadedAt: new Date()
      };

    } catch (error: any) {
      console.error('❌ Erreur upload fichier:', error);
      throw new Error(`Erreur lors de l'upload: ${error.message}`);
    }
  }

  /**
   * Upload plusieurs fichiers
   */
  async uploadMultipleFiles(
    files: Array<{ buffer: Buffer; originalName: string }>,
    folder: string = 'uploads',
    allowedTypes: string[] = ['application/pdf'],
    maxSizeMB: number = 10
  ): Promise<UploadedFile[]> {
    const uploadPromises = files.map(file => 
      this.uploadFile(file.buffer, file.originalName, folder, allowedTypes, maxSizeMB)
    );

    return Promise.all(uploadPromises);
  }

  /**
   * Supprimer un fichier
   */
  async deleteFile(fileUrl: string): Promise<void> {
    try {
      // Extraire le chemin du fichier depuis l'URL
      const urlParts = fileUrl.split(`${this.bucket.name}/`);
      if (urlParts.length < 2) {
        throw new Error('URL de fichier invalide');
      }

      const filePath = urlParts[1];
      await this.bucket.file(filePath).delete();

      console.log(`✅ Fichier supprimé: ${filePath}`);
    } catch (error: any) {
      console.error('❌ Erreur suppression fichier:', error);
      throw new Error(`Erreur lors de la suppression: ${error.message}`);
    }
  }

  /**
   * Supprimer plusieurs fichiers
   */
  async deleteMultipleFiles(fileUrls: string[]): Promise<void> {
    const deletePromises = fileUrls.map(url => this.deleteFile(url));
    await Promise.all(deletePromises);
  }

  /**
   * Obtenir le type MIME d'un fichier
   */
  private getMimeType(fileName: string): string {
    const extension = this.getFileExtension(fileName).toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.mp4': 'video/mp4',
      '.avi': 'video/x-msvideo'
    };

    return mimeTypes[extension] || 'application/octet-stream';
  }

  /**
   * Obtenir l'extension d'un fichier
   */
  private getFileExtension(fileName: string): string {
    const lastDot = fileName.lastIndexOf('.');
    return lastDot !== -1 ? fileName.substring(lastDot) : '';
  }

  /**
   * Vérifier si un fichier existe
   */
  async fileExists(fileUrl: string): Promise<boolean> {
    try {
      const urlParts = fileUrl.split(`${this.bucket.name}/`);
      if (urlParts.length < 2) return false;

      const filePath = urlParts[1];
      const [exists] = await this.bucket.file(filePath).exists();
      return exists;
    } catch (error) {
      return false;
    }
  }
}

export const storageService = new StorageService();
