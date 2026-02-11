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
   * Body: { plan, userId, classe, typeAbonnement, matieres? }
   */
  async createSubscriptionPayment(req: Request, res: Response): Promise<void> {
    try {
      const { userId, classe, niveauScolaire, typeAbonnement, matieres } = req.body;

      // Validation des champs requis
      if (!userId || !classe || !niveauScolaire || !typeAbonnement) {
        res.status(400).json({
          success: false,
          message: 'userId, classe, niveauScolaire et typeAbonnement requis'
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

      // Vérifier que la classe correspond
      if (user.classe !== classe) {
        res.status(400).json({
          success: false,
          message: `La classe sélectionnée "${classe}" ne correspond pas à votre classe "${user.classe}"`
        });
        return;
      }

      // Vérifier que le niveau scolaire correspond
      if (user.niveauScolaire !== niveauScolaire) {
        res.status(400).json({
          success: false,
          message: `Le niveau scolaire sélectionné "${niveauScolaire}" ne correspond pas à votre niveau "${user.niveauScolaire}"`
        });
        return;
      }

      // Validation selon le type d'abonnement
      if (typeAbonnement === 'CLASSE' && niveauScolaire !== 'ELEMENTAIRE') {
        res.status(400).json({
          success: false,
          message: 'Le typeAbonnement doit être CLASSE pour ELEMENTAIRE'
        });
        return;
      }

      if (typeAbonnement === 'MATIERE' && niveauScolaire === 'ELEMENTAIRE') {
        res.status(400).json({
          success: false,
          message: 'Le typeAbonnement doit être MATIERE pour MOYEN/SECONDAIRE/UNIVERSITAIRE'
        });
        return;
      }

      if (typeAbonnement === 'CLASSE' && matieres && matieres.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Les matières ne sont pas autorisées pour l\'abonnement CLASSE (élémentaire)'
        });
        return;
      }

      if (typeAbonnement === 'MATIERE' && (!matieres || matieres.length !== 3)) {
        res.status(400).json({
          success: false,
          message: 'Pour MOYEN/SECONDAIRE/UNIVERSITAIRE, vous devez choisir EXACTEMENT 3 matières'
        });
        return;
      }

      // Vérifier si l'utilisateur a déjà un abonnement actif
      const existingSubscription = await subscriptionService.getActiveSubscription(userId);
      if (existingSubscription) {
        res.status(400).json({
          success: false,
          message: 'Vous avez déjà un abonnement actif',
          data: {
            subscriptionEndDate: existingSubscription.endDate,
            typeAbonnement: existingSubscription.typeAbonnement,
            classe: existingSubscription.classe
          }
        });
        return;
      }

      // Vérifier que l'utilisateur a un niveauScolaire défini
      if (!user.niveauScolaire) {
        res.status(400).json({
          success: false,
          message: 'Le niveau scolaire de l\'utilisateur n\'est pas défini'
        });
        return;
      }

      // Créer le paiement Wave pour l'abonnement
      const paymentData = await waveSubscriptionService.createSubscriptionPayment(typeAbonnement, userId, {
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        classe: classe,
        niveauScolaire: user.niveauScolaire,
        typeAbonnement: typeAbonnement,
        matieres: matieres
      });

      // Enregistrer la transaction de paiement dans Firestore
      await paymentService.create({
        userId: userId,
        paymentType: 'subscription',
        subscriptionId: paymentData.subscriptionId,
        typeAbonnement: typeAbonnement,
        amount: paymentData.amount,
        currency: 'XOF',
        paymentMethod: 'wave',
        status: 'PENDING',
        metadata: {
          wavePaymentId: paymentData.paymentId,
          checkoutUrl: paymentData.paymentUrl,
          classe: classe,
          typeAbonnement: typeAbonnement,
          matieres: matieres || []
        }
      });

      res.status(200).json({
        success: true,
        data: {
          paymentUrl: paymentData.paymentUrl,
          paymentId: paymentData.paymentId,
          subscriptionId: paymentData.subscriptionId,
          amount: paymentData.amount,
          classe: classe,
          typeAbonnement: typeAbonnement,
          matieres: matieres || [],
          currency: 'XOF'
        },
        message: typeAbonnement === 'CLASSE' 
          ? `Paiement d'abonnement créé pour la classe "${classe}" (5 000 FCFA/an)`
          : `Paiement d'abonnement créé pour 3 matières (5 000 FCFA/an)`
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
   * Obtenir les matières disponibles pour un niveau (deprecated - utiliser /api/matieres)
   * GET /api/subscriptions/matieres/:niveau
   */
  async getAvailableSubjects(req: Request, res: Response): Promise<void> {
    try {
      const { niveau } = req.params;
      
      if (!niveau) {
        res.status(400).json({
          success: false,
          message: 'Niveau requis'
        });
        return;
      }

      const matieres = await subscriptionService.getAvailableSubjects(niveau as any);

      res.status(200).json({
        success: true,
        data: matieres,
        count: matieres.length,
        message: 'Utilisez plutôt /api/matieres/niveau/:niveau ou /api/matieres/classe/:classe'
      });

    } catch (error: any) {
      console.error('❌ Erreur récupération matières:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération des matières'
      });
    }
  }

  /**
   * Vérifier si un utilisateur a accès à un cours
   * GET /api/subscriptions/check-course-access/:userId/:courseId
   */
  async checkCourseAccess(req: Request, res: Response): Promise<void> {
    try {
      const { userId, courseId } = req.params;

      const hasAccess = await subscriptionService.hasAccessToCourse(userId, courseId);

      res.status(200).json({
        success: true,
        data: {
          userId,
          courseId,
          hasAccess
        }
      });

    } catch (error: any) {
      console.error('❌ Erreur vérification accès cours:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la vérification de l\'accès'
      });
    }
  }

  /**
   * Vérifier si un utilisateur a un abonnement actif (ancien endpoint pour compatibilité)
   * GET /api/subscriptions/check-access/:userId
   */
  async checkUnlimitedAccess(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      const subscription = await subscriptionService.getActiveSubscription(userId);
      const hasAccess = subscription !== null;

      res.status(200).json({
        success: true,
        data: {
          hasActiveSubscription: hasAccess,
          subscription: subscription ? {
            classe: subscription.classe,
            typeAbonnement: subscription.typeAbonnement,
            niveauScolaire: subscription.niveauScolaire,
            endDate: subscription.endDate,
            matieres: subscription.matieres || []
          } : null
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
