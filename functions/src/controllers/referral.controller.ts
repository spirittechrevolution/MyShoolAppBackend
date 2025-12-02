/**
 * Contrôleur de gestion des parrainages
 */

import { Request, Response } from 'express';
import { ReferralService } from '../services/referral.service';
import { smsService } from '../services/sms.service';

const referralService = new ReferralService();

export class ReferralController {
  /**
   * Génère un lien de parrainage
   * POST /api/referrals/generate
   */
  async generateReferralLink(req: Request, res: Response): Promise<void> {
    try {
      const { userId, bonusAmount, bonusType } = req.body;

      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'userId est requis'
        });
        return;
      }

      const referral = await referralService.generateReferralLink(
        userId,
        bonusAmount || 500,
        bonusType || 'DISCOUNT'
      );

      // Si un numéro de téléphone est fourni, envoie un SMS d'invitation
      if (req.body.phoneNumber && req.body.referrerName) {
        try {
          await smsService.sendReferralSms(
            req.body.phoneNumber,
            req.body.referrerName,
            referral.referralCode,
            referral.bonusAmount
          );
          console.log(`📱 SMS d'invitation envoyé à ${req.body.phoneNumber}`);
        } catch (smsError: any) {
          console.error('❌ Erreur envoi SMS:', smsError.message);
          // Continue même si le SMS échoue
        }
      }

      res.status(201).json({
        success: true,
        data: {
          code: referral.referralCode,
          deepLink: referral.metadata?.deepLink,
          webLink: referral.metadata?.webLink,
          shareText: referral.metadata?.shareText,
          bonusAmount: referral.bonusAmount,
          expiresAt: referral.expiresAt
        }
      });
    } catch (error: any) {
      console.error('❌ Erreur génération lien parrainage:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la génération du lien'
      });
    }
  }

  /**
   * Récupère les parrainages d'un utilisateur
   * GET /api/referrals/user/:userId
   */
  async getUserReferrals(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      const referrals = await referralService.getUserReferrals(userId);

      res.status(200).json({
        success: true,
        data: referrals,
        count: referrals.length
      });
    } catch (error: any) {
      console.error('❌ Erreur récupération parrainages utilisateur:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération des parrainages'
      });
    }
  }

  /**
   * Récupère les statistiques de parrainage d'un utilisateur
   * GET /api/referrals/user/:userId/stats
   */
  async getUserStats(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      const stats = await referralService.getUserReferralStats(userId);

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      console.error('❌ Erreur récupération stats parrainage:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération des statistiques'
      });
    }
  }

  /**
   * Enregistre un clic sur un lien de parrainage
   * POST /api/referrals/track-click
   */
  async trackClick(req: Request, res: Response): Promise<void> {
    try {
      const { code, source } = req.body;

      if (!code) {
        res.status(400).json({
          success: false,
          message: 'code est requis'
        });
        return;
      }

      const referral = await referralService.trackClick(code, source);

      if (!referral) {
        res.status(404).json({
          success: false,
          message: 'Code de parrainage non trouvé ou expiré'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          code: referral.referralCode,
          clicks: referral.clicks,
          message: 'Clic enregistré avec succès'
        }
      });
    } catch (error: any) {
      console.error('❌ Erreur enregistrement clic:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de l\'enregistrement du clic'
      });
    }
  }

  /**
   * Valide un code de parrainage lors de l'inscription
   * POST /api/referrals/validate
   */
  async validateReferralCode(req: Request, res: Response): Promise<void> {
    try {
      const { code, userId } = req.body;

      if (!code || !userId) {
        res.status(400).json({
          success: false,
          message: 'code et userId sont requis'
        });
        return;
      }

      const referral = await referralService.validateAndComplete(code, userId);

      if (!referral) {
        res.status(404).json({
          success: false,
          message: 'Code de parrainage invalide'
        });
        return;
      }

      // Envoie SMS de bienvenue au nouveau utilisateur et SMS de succès au parrain
      try {
        // SMS de bienvenue au filleul (si numéro fourni)
        if (req.body.phoneNumber && req.body.firstName) {
          await smsService.sendWelcomeSms(
            req.body.phoneNumber,
            req.body.firstName,
            referral.bonusAmount
          );
          console.log(`📱 SMS de bienvenue envoyé à ${req.body.phoneNumber}`);
        }

        // SMS de succès au parrain (nécessite de récupérer les infos du parrain)
        if (req.body.referrerPhone && req.body.referrerName) {
          await smsService.sendReferralSuccessSms(
            req.body.referrerPhone,
            req.body.referrerName,
            req.body.firstName || 'Un ami',
            referral.bonusAmount
          );
          console.log(`📱 SMS de succès envoyé au parrain ${req.body.referrerPhone}`);
        }
      } catch (smsError: any) {
        console.error('❌ Erreur envoi SMS:', smsError.message);
        // Continue même si le SMS échoue
      }

      res.status(200).json({
        success: true,
        data: {
          bonusAmount: referral.bonusAmount,
          bonusType: referral.bonusType,
          referrerId: referral.referrerId,
          message: `Félicitations ! Vous recevez ${referral.bonusAmount / 100} FCFA de bonus de bienvenue !`
        }
      });
    } catch (error: any) {
      console.error('❌ Erreur validation code parrainage:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Erreur lors de la validation du code'
      });
    }
  }

  /**
   * Récupère un parrainage par son code
   * GET /api/referrals/code/:code
   */
  async getReferralByCode(req: Request, res: Response): Promise<void> {
    try {
      const { code } = req.params;

      const referral = await referralService.getReferralByCode(code);

      if (!referral) {
        res.status(404).json({
          success: false,
          message: 'Code de parrainage non trouvé'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: referral
      });
    } catch (error: any) {
      console.error('❌ Erreur récupération parrainage par code:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération du parrainage'
      });
    }
  }

  /**
   * Récupère un parrainage par ID
   * GET /api/referrals/:id
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const referral = await referralService.getById(id);

      if (!referral) {
        res.status(404).json({
          success: false,
          message: 'Parrainage non trouvé'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: referral
      });
    } catch (error: any) {
      console.error('❌ Erreur récupération parrainage:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération du parrainage'
      });
    }
  }

  /**
   * Récupère tous les parrainages (Admin)
   * GET /api/referrals
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const referrals = await referralService.getAll();

      res.status(200).json({
        success: true,
        data: referrals,
        count: referrals.length
      });
    } catch (error: any) {
      console.error('❌ Erreur récupération parrainages:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération des parrainages'
      });
    }
  }

  /**
   * Annule un parrainage
   * POST /api/referrals/:id/cancel
   */
  async cancel(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await referralService.cancelReferral(id);

      res.status(200).json({
        success: true,
        message: 'Parrainage annulé avec succès'
      });
    } catch (error: any) {
      console.error('❌ Erreur annulation parrainage:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de l\'annulation du parrainage'
      });
    }
  }

  /**
   * Supprime un parrainage
   * DELETE /api/referrals/:id
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await referralService.delete(id);

      res.status(200).json({
        success: true,
        message: 'Parrainage supprimé avec succès'
      });
    } catch (error: any) {
      console.error('❌ Erreur suppression parrainage:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la suppression du parrainage'
      });
    }
  }
}

export const referralController = new ReferralController();
