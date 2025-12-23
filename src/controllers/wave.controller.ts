/**
 * Contrôleur pour les paiements Wave
 */

import { Request, Response } from 'express';
import { waveService } from '../services/wave.service';
import { PaymentService } from '../services/payment.service';
import { UserService } from '../services/user.service';

const paymentService = new PaymentService();
const userService = new UserService();

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
        email: user.login, // utilise le login comme email
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
        paymentId: paymentData.paymentId,
        status: 'pending',
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
      const courseId = data.metadata?.courseId;
      const userId = data.metadata?.userId;

      if (!courseId || !userId) {
        console.error('❌ Métadonnées manquantes dans le webhook Wave');
        return;
      }

      // Mettre à jour le statut du paiement
      await paymentService.updatePaymentStatus(wavePaymentId, 'completed', {
        waveData: data,
        completedAt: new Date()
      });

      // Inscrire l'utilisateur au cours
      const { EnrollmentService } = await import('../services/enrollment.service');
      const enrollmentService = new EnrollmentService();
      await enrollmentService.create({
        userId: userId,
        courseId: courseId,
        enrolledAt: new Date(),
        status: 'in-progress',
        paymentId: wavePaymentId
      });

      console.log(`✅ Paiement Wave complété et inscription créée - User: ${userId}, Course: ${courseId}`);

    } catch (error) {
      console.error('❌ Erreur traitement paiement réussi:', error);
    }
  }

  /**
   * Traiter un paiement échoué
   */
  private async handlePaymentFailed(webhookData: any): Promise<void> {
    try {
      const { data } = webhookData;
      const wavePaymentId = data.id;

      // Mettre à jour le statut du paiement
      await paymentService.updatePaymentStatus(wavePaymentId, 'failed', {
        waveData: data,
        failedAt: new Date()
      });

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
            status: 'in-progress',
            paymentId: paymentId
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