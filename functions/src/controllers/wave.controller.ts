/**
 * Contrôleur pour les paiements Wave
 */

import { Request, Response } from 'express';
import { waveService } from '../services/wave.service';
import { PaymentService } from '../services/payment.service';
import { PaymentStatus } from '../models/payment.model';
import { UserService } from '../services/user.service';
import { SubscriptionService } from '../services/subscription.service';

const paymentService = new PaymentService();
const userService = new UserService();
const subscriptionService = new SubscriptionService();

export class WaveController {
  /**
   * Initier un paiement Wave pour un cours
   * POST /api/wave/create-payment
   */
  async createCoursePayment(req: Request, res: Response): Promise<void> {
    try {
      const { courseId, userId } = req.body;

      if (!courseId || !userId) {
        res.status(400).json({
          success: false,
          message: 'courseId et userId sont requis'
        });
        return;
      }

      // Récupérer les informations utilisateur
      const user = await userService.getById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Utilisateur non trouvé'
        });
        return;
      }

      // Créer le paiement Wave
      const paymentData = await waveService.createCoursePayment(courseId, userId, {
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName
      });

      // Enregistrer la transaction en attente dans Firestore
      await paymentService.create({
        userId: userId,
        courseId: courseId,
        amount: paymentData.amount,
        currency: 'XOF',
        paymentMethod: 'wave',
        status: 'PENDING' as PaymentStatus,
        metadata: {
          wavePaymentId: paymentData.paymentId,
          checkoutUrl: paymentData.paymentUrl
        }
      });

      res.status(200).json({
        success: true,
        data: {
          paymentUrl: paymentData.paymentUrl,
          paymentId: paymentData.paymentId,
          amount: paymentData.amount,
          currency: 'XOF'
        },
        message: 'Paiement Wave créé avec succès'
      });

    } catch (error: any) {
      console.error('❌ Erreur création paiement Wave:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la création du paiement'
      });
    }
  }

  /**
   * Vérifier le statut d'un paiement Wave
   * GET /api/wave/payment-status/:paymentId
   */
  async getPaymentStatus(req: Request, res: Response): Promise<void> {
    try {
      const { paymentId } = req.params;

      const paymentStatus = await waveService.getPaymentStatus(paymentId);

      res.status(200).json({
        success: true,
        data: paymentStatus
      });

    } catch (error: any) {
      console.error('❌ Erreur récupération statut paiement:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération du statut'
      });
    }
  }

  /**
   * Webhook Wave pour les notifications de paiement
   * POST /api/wave/webhook
   */
  async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      const signature = req.headers['x-wave-signature'] as string;
      const payload = JSON.stringify(req.body);

      // Vérifier la signature
      if (!waveService.verifyWebhookSignature(payload, signature)) {
        console.error('❌ Signature webhook Wave invalide');
        res.status(401).json({
          success: false,
          message: 'Signature invalide'
        });
        return;
      }

      const webhookData = req.body;
      console.log('📧 Webhook Wave reçu:', webhookData);

      // Traiter selon le type d'événement
      switch (webhookData.type) {
        case 'checkout.session.completed':
          await this.handlePaymentCompleted(webhookData);
          break;
        case 'checkout.session.payment_failed':
          await this.handlePaymentFailed(webhookData);
          break;
        case 'b2b.payment_received':
          await this.handlePaymentCompleted(webhookData);
          break;
        default:
          console.log(`🔔 Événement Wave non traité: ${webhookData.type}`);
      }

      res.status(200).json({
        success: true,
        message: 'Webhook traité'
      });

    } catch (error: any) {
      console.error('❌ Erreur traitement webhook Wave:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur traitement webhook'
      });
    }
  }

  /**
   * Traiter un paiement réussi
   */
  private async handlePaymentCompleted(webhookData: any): Promise<void> {
    try {
      const { data } = webhookData;
      const wavePaymentId = data.id;
      const metadata = data.metadata || {};
      const paymentType = metadata.type; // 'course_payment' ou 'subscription_payment'

      // Traiter selon le type de paiement
      if (paymentType === 'subscription_payment') {
        await this.handleSubscriptionPayment(metadata, wavePaymentId);
      } else {
        // Paiement de cours par défaut
        await this.handleCoursePayment(metadata, wavePaymentId);
      }

      console.log(`✅ Paiement Wave complété - Type: ${paymentType || 'course'}, PaymentId: ${wavePaymentId}`);

    } catch (error) {
      console.error('❌ Erreur traitement paiement réussi:', error);
    }
  }

  /**
   * Traiter un paiement de cours
   */
  private async handleCoursePayment(metadata: any, wavePaymentId: string): Promise<void> {
    const courseId = metadata.courseId;
    const userId = metadata.userId;

    if (!courseId || !userId) {
      console.error('❌ Métadonnées manquantes pour le paiement de cours');
      return;
    }

    // Mettre à jour le statut du paiement
    await paymentService.updateStatus(wavePaymentId, 'SUCCESS' as PaymentStatus);

    // Inscrire l'utilisateur au cours
    const { EnrollmentService } = await import('../services/enrollment.service');
    const enrollmentService = new EnrollmentService();
    await enrollmentService.create({
      userId: userId,
      courseId: courseId,
      enrolledAt: new Date(),
      status: 'in-progress',
      paymentMethod: 'wave'
    });

    console.log(`✅ Inscription au cours créée - User: ${userId}, Course: ${courseId}`);
  }

  /**
   * Traiter un paiement d'abonnement
   */
  private async handleSubscriptionPayment(metadata: any, wavePaymentId: string): Promise<void> {
    const subscriptionId = metadata.subscriptionId;
    const userId = metadata.userId;

    if (!subscriptionId || !userId) {
      console.error('❌ Métadonnées manquantes pour le paiement d\'abonnement');
      return;
    }

    // Mettre à jour le statut du paiement
    await paymentService.updateStatus(wavePaymentId, 'SUCCESS' as PaymentStatus);

    // Activer l'abonnement (sans les paramètres supplémentaires)
    await subscriptionService.activateSubscription(subscriptionId, wavePaymentId, 'wave');

    console.log(`✅ Abonnement activé - User: ${userId}, Subscription: ${subscriptionId}`);
  }

  /**
   * Traiter un paiement échoué
   */
  private async handlePaymentFailed(webhookData: any): Promise<void> {
    try {
      const { data } = webhookData;
      const wavePaymentId = data.id;

      // Mettre à jour le statut du paiement
      await paymentService.updateStatus(wavePaymentId, 'FAILED' as PaymentStatus);

      console.log(`❌ Paiement Wave échoué - PaymentId: ${wavePaymentId}`);

    } catch (error) {
      console.error('❌ Erreur traitement paiement échoué:', error);
    }
  }

  /**
   * Confirmer un paiement (appelé après retour depuis Wave)
   * POST /api/wave/confirm-payment
   */
  async confirmPayment(req: Request, res: Response): Promise<void> {
    try {
      const { paymentId, userId, courseId } = req.body;

      if (!paymentId) {
        res.status(400).json({
          success: false,
          message: 'paymentId requis'
        });
        return;
      }

      // Vérifier le statut du paiement chez Wave
      const wavePayment = await waveService.getPaymentStatus(paymentId);

      if (wavePayment.checkout_status === 'successful') {
        // Vérifier si l'inscription existe déjà
        const { EnrollmentService } = await import('../services/enrollment.service');
        const enrollmentService = new EnrollmentService();
        const existingEnrollment = await enrollmentService.getUserEnrollment(userId, courseId);
        
        if (!existingEnrollment) {
          // Créer l'inscription si elle n'existe pas
          await enrollmentService.create({
            userId: userId,
            courseId: courseId,
            enrolledAt: new Date(),
            status: 'in-progress'
          });
        }

        res.status(200).json({
          success: true,
          data: {
            status: 'completed',
            enrollmentCreated: !existingEnrollment
          },
          message: 'Paiement confirmé et inscription créée'
        });
      } else {
        res.status(400).json({
          success: false,
          data: {
            status: wavePayment.checkout_status
          },
          message: 'Paiement non confirmé'
        });
      }

    } catch (error: any) {
      console.error('❌ Erreur confirmation paiement:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la confirmation du paiement'
      });
    }
  }
}

export const waveController = new WaveController();