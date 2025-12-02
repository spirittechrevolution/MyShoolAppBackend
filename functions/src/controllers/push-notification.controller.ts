/**
 * Contrôleur pour la gestion des tokens FCM et notifications push
 */

import { Request, Response } from 'express';
import { pushNotificationService } from '../services/push-notification.service';

export class PushNotificationController {
  /**
   * Enregistre un token FCM pour un utilisateur
   * POST /api/push-notifications/register-token
   * @param {Request} req - Requête Express
   * @param {Response} res - Réponse Express
   */
  async registerToken(req: Request, res: Response): Promise<void> {
    try {
      const { userId, token, platform, deviceId, deviceName } = req.body;

      if (!userId || !token || !platform) {
        res.status(400).json({
          success: false,
          message: 'userId, token et platform sont requis',
        });
        return;
      }

      if (!['ios', 'android', 'web'].includes(platform)) {
        res.status(400).json({
          success: false,
          message: 'platform doit être ios, android ou web',
        });
        return;
      }

      await pushNotificationService.saveUserToken(
        userId,
        token,
        platform,
        deviceId,
        deviceName
      );

      res.status(200).json({
        success: true,
        message: 'Token FCM enregistré avec succès',
      });
    } catch (error: any) {
      console.error('❌ Erreur enregistrement token:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de l\'enregistrement du token',
      });
    }
  }

  /**
   * Supprime un token FCM
   * DELETE /api/push-notifications/remove-token
   * @param {Request} req - Requête Express
   * @param {Response} res - Réponse Express
   */
  async removeToken(req: Request, res: Response): Promise<void> {
    try {
      const { userId, token } = req.body;

      if (!userId || !token) {
        res.status(400).json({
          success: false,
          message: 'userId et token sont requis',
        });
        return;
      }

      await pushNotificationService.removeUserToken(userId, token);

      res.status(200).json({
        success: true,
        message: 'Token FCM supprimé avec succès',
      });
    } catch (error: any) {
      console.error('❌ Erreur suppression token:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la suppression du token',
      });
    }
  }

  /**
   * Envoie une notification test
   * POST /api/push-notifications/send-test
   * @param {Request} req - Requête Express
   * @param {Response} res - Réponse Express
   */
  async sendTestNotification(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.body;

      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'userId est requis',
        });
        return;
      }

      const notification = await pushNotificationService.sendGeneralNotification(
        userId,
        '🔔 Notification test',
        'Ceci est une notification test de MySchool. Si vous recevez ce message, les notifications fonctionnent correctement!',
        {
          screen: 'Home',
          isTest: 'true',
        }
      );

      res.status(200).json({
        success: true,
        data: notification,
        message: 'Notification test envoyée',
      });
    } catch (error: any) {
      console.error('❌ Erreur envoi notification test:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de l\'envoi de la notification',
      });
    }
  }

  /**
   * Récupère les notifications d'un utilisateur
   * GET /api/push-notifications/user/:userId
   * @param {Request} req - Requête Express
   * @param {Response} res - Réponse Express
   */
  async getUserNotifications(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;

      const notifications = await pushNotificationService.getUserNotifications(
        userId,
        limit
      );

      res.status(200).json({
        success: true,
        data: notifications,
        count: notifications.length,
      });
    } catch (error: any) {
      console.error('❌ Erreur récupération notifications:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération des notifications',
      });
    }
  }

  /**
   * Marque une notification comme lue
   * PATCH /api/push-notifications/:id/read
   * @param {Request} req - Requête Express
   * @param {Response} res - Réponse Express
   */
  async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await pushNotificationService.markAsRead(id);

      res.status(200).json({
        success: true,
        message: 'Notification marquée comme lue',
      });
    } catch (error: any) {
      console.error('❌ Erreur marquage notification:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors du marquage de la notification',
      });
    }
  }

  /**
   * Récupère les tokens d'un utilisateur (pour debug)
   * GET /api/push-notifications/tokens/:userId
   * @param {Request} req - Requête Express
   * @param {Response} res - Réponse Express
   */
  async getUserTokens(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      const tokens = await pushNotificationService.getUserTokens(userId);

      res.status(200).json({
        success: true,
        data: tokens,
        count: tokens.length,
      });
    } catch (error: any) {
      console.error('❌ Erreur récupération tokens:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération des tokens',
      });
    }
  }
}
