/**
 * Contrôleur pour les abonnements
 */

import { Request, Response } from 'express';
import { SubscriptionService } from '../services/subscription.service';
import { WaveSubscriptionService } from '../services/wave-subscription.service';
import { UserService } from '../services/user.service';
import { PaymentService } from '../services/payment.service';

const subscriptionService = new SubscriptionService();
const waveSubscriptionService = new WaveSubscriptionService();
const userService = new UserService();
const paymentService = new PaymentService();

export class SubscriptionController {
  /**
   * Créer un paiement d'abonnement Wave
   * POST /api/subscriptions/create-payment
   */
  async createSubscriptionPayment(req: Request, res: Response): Promise<void> {
    try {
      const { plan, userId, category } = req.body;

      if (!plan || !userId || !category) {
        res.status(400).json({
          success: false,
          message: 'plan, userId et category requis'
        });
        return;
      }

      // Récupérer l'utilisateur
      const user = await userService.getById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Utilisateur non trouvé'
        });
        return;
      }

      // Vérifier si l'utilisateur a déjà un abonnement actif pour cette catégorie
      const existingSubscription = await subscriptionService.getActiveCategorySubscription(userId, category);
      if (existingSubscription) {
        res.status(400).json({
          success: false,
          message: `Vous avez déjà un abonnement actif pour la catégorie "${category}"`,
          data: {
            subscriptionEndDate: existingSubscription.endDate,
            plan: existingSubscription.plan,
            category: existingSubscription.category
          }
        });
        return;
      }

      // Créer le paiement Wave pour l'abonnement
      const paymentData = await waveSubscriptionService.createSubscriptionPayment(plan, userId, {
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName
      }, category);

      // Enregistrer la transaction de paiement dans Firestore
      await paymentService.create({
        userId: userId,
        paymentType: 'subscription',
        subscriptionId: paymentData.subscriptionId,
        subscriptionPlan: plan,
        amount: paymentData.amount,
        currency: 'XOF',
        paymentMethod: 'wave',
        status: 'PENDING',
        metadata: {
          wavePaymentId: paymentData.paymentId,
          checkoutUrl: paymentData.paymentUrl,
          plan: plan,
          category: category
        }
      });

      res.status(200).json({
        success: true,
        data: {
          paymentUrl: paymentData.paymentUrl,
          paymentId: paymentData.paymentId,
          subscriptionId: paymentData.subscriptionId,
          amount: paymentData.amount,
          plan: plan,
          category: category,
          currency: 'XOF'
        },
        message: `Paiement d'abonnement créé pour la catégorie "${category}"`
      });

    } catch (error: any) {
      console.error('❌ Erreur création paiement abonnement:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la création du paiement'
      });
    }
  }

  /**
   * Obtenir l'abonnement actif d'un utilisateur
   * GET /api/subscriptions/active/:userId
   */
  async getActiveSubscription(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      const subscription = await subscriptionService.getActiveSubscription(userId);

      if (!subscription) {
        res.status(404).json({
          success: false,
          message: 'Aucun abonnement actif trouvé'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: subscription.toJSON()
      });

    } catch (error: any) {
      console.error('❌ Erreur récupération abonnement actif:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération de l\'abonnement'
      });
    }
  }

  /**
   * Obtenir tous les abonnements d'un utilisateur
   * GET /api/subscriptions/user/:userId
   */
  async getUserSubscriptions(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      const subscriptions = await subscriptionService.getUserSubscriptions(userId);

      res.status(200).json({
        success: true,
        data: subscriptions.map(sub => sub.toJSON()),
        count: subscriptions.length
      });

    } catch (error: any) {
      console.error('❌ Erreur récupération abonnements utilisateur:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération des abonnements'
      });
    }
  }

  /**
   * Annuler un abonnement
   * POST /api/subscriptions/:subscriptionId/cancel
   */
  async cancelSubscription(req: Request, res: Response): Promise<void> {
    try {
      const { subscriptionId } = req.params;

      await subscriptionService.cancelSubscription(subscriptionId);

      res.status(200).json({
        success: true,
        message: 'Abonnement annulé avec succès'
      });

    } catch (error: any) {
      console.error('❌ Erreur annulation abonnement:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de l\'annulation de l\'abonnement'
      });
    }
  }

  /**
   * Obtenir les plans d'abonnement disponibles
   * GET /api/subscriptions/plans
   */
  async getAvailablePlans(req: Request, res: Response): Promise<void> {
    try {
      const { category } = req.query;
      const plans = subscriptionService.getAvailablePlans(category as string);

      res.status(200).json({
        success: true,
        data: {
          category: category || 'default',
          plans
        }
      });

    } catch (error: any) {
      console.error('❌ Erreur récupération plans:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération des plans'
      });
    }
  }

  /**
   * Obtenir toutes les catégories disponibles avec leurs prix
   * GET /api/subscriptions/categories
   */
  async getAvailableCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = subscriptionService.getAvailableCategories();

      res.status(200).json({
        success: true,
        data: categories
      });

    } catch (error: any) {
      console.error('❌ Erreur récupération catégories:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération des catégories'
      });
    }
  }

  /**
   * Vérifier si un utilisateur a un accès à une catégorie
   * GET /api/subscriptions/check-access/:userId/:category
   */
  async checkCategoryAccess(req: Request, res: Response): Promise<void> {
    try {
      const { userId, category } = req.params;

      const hasAccess = await subscriptionService.hasCategoryAccess(userId, category);

      res.status(200).json({
        success: true,
        data: {
          userId,
          category,
          hasCategoryAccess: hasAccess
        }
      });

    } catch (error: any) {
      console.error('❌ Erreur vérification accès catégorie:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la vérification de l\'accès'
      });
    }
  }

  /**
   * Vérifier si un utilisateur a un accès illimité (ancien endpoint pour compatibilité)
   * GET /api/subscriptions/check-access/:userId
   */
  async checkUnlimitedAccess(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      const activeSubscriptions = await subscriptionService.getUserActiveSubscriptions(userId);
      const hasAccess = activeSubscriptions.length > 0;

      res.status(200).json({
        success: true,
        data: {
          hasUnlimitedAccess: hasAccess,
          activeSubscriptions: activeSubscriptions.map(sub => ({
            category: sub.category,
            plan: sub.plan,
            endDate: sub.endDate
          }))
        }
      });

    } catch (error: any) {
      console.error('❌ Erreur vérification accès:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la vérification de l\'accès'
      });
    }
  }
}

export const subscriptionController = new SubscriptionController();
