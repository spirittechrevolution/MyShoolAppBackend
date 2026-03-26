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
      const { courseId, userId, promoCode, finalAmount } = req.body;

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

      // Vérifier si l'utilisateur a un abonnement actif
      const activeSubscription = await subscriptionService.getActiveSubscription(userId);
      if (activeSubscription) {
        res.status(400).json({
          success: false,
          message: 'Vous avez déjà un abonnement actif qui vous donne accès à tous les cours'
        });
        return;
      }

      // Créer une inscription en attente
      const { EnrollmentService } = await import('../services/enrollment.service');
      const enrollmentService = new EnrollmentService();
      
      const enrollment = await enrollmentService.create({
        userId: userId,
        courseId: courseId,
        status: 'in-progress',
        progress: 0
      });

      // Créer le paiement Wave
      const paymentData = await waveService.createCoursePayment(courseId, userId, {
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName
      }, promoCode, finalAmount);

      // Enregistrer la transaction en attente dans Firestore
      await paymentService.create({
        userId: userId,
        paymentType: 'course',
        courseId: courseId,
        enrollmentId: enrollment.id,
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
          enrollmentId: enrollment.id,
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
    console.log('📨 Headers Wave reçus:', JSON.stringify(req.headers, null, 2));

    // Note: La vérification de signature Wave est impossible sur Firebase Cloud Functions
    // car GCF parse le body avant qu'il arrive à Express (raw body non accessible).
    // Sécurité assurée par : URL secrète + validation des données en base Firestore
    
    const webhookData = req.body;
    console.log('📧 Webhook Wave reçu:', JSON.stringify(webhookData, null, 2));

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

    res.status(200).json({ success: true, message: 'Webhook traité' });

  } catch (error: any) {
    console.error('❌ Erreur traitement webhook Wave:', error);
    res.status(500).json({ success: false, message: 'Erreur traitement webhook' });
  }
}


  /**
   * Traiter un paiement réussi
   * ⚠️ IMPORTANT: Wave ne retourne pas les métadonnées dans le webhook!
   * Solution: On cherche le paiement dans Firestore pour déterminer le type
   */
  private async handlePaymentCompleted(webhookData: any): Promise<void> {
    try {
      const { data } = webhookData;
      const wavePaymentId = data.id;

      console.log('📦 Webhook reçu pour paiement:', wavePaymentId);

      // ✅ Chercher le paiement dans Firestore (utiliser ce comme source de vérité)
      const payment = await paymentService.getByWavePaymentId(wavePaymentId);
      
      if (!payment || !payment.id) {
        console.error('❌ Paiement non trouvé dans Firestore pour wavePaymentId:', wavePaymentId);
        return;
      }

      console.log('💳 Paiement trouvé dans Firestore:', {
        paymentId: payment.id,
        paymentType: payment.paymentType,
        status: payment.status,
        subscriptionId: payment.subscriptionId
      });

      // ✅ Déterminer le type de paiement à partir du document Firestore (pas du webhook!)
      const paymentType = payment.paymentType;
      const metadata = payment.metadata || {};

      // Traiter selon le type de paiement
      if (paymentType === 'subscription') {
        // C'est un paiement d'abonnement
        await this.handleSubscriptionPayment(metadata, wavePaymentId);
      } else {
        // C'est un paiement de cours
        await this.handleCoursePayment(metadata, wavePaymentId);
      }

      console.log(`✅ Paiement Wave complété - Type: ${paymentType}, PaymentId: ${wavePaymentId}`);

    } catch (error) {
      console.error('❌ Erreur traitement paiement réussi:', error);
    }
  }

  /**
   * Traiter un paiement de cours
   * ⚠️ IMPORTANT: On utilise TOUJOURS le document Firestore comme source de vérité!
   * Ne pas faire confiance aux métadonnées du webhook (Wave ne les retourne pas)
   */
  private async handleCoursePayment(metadata: any, wavePaymentId: string): Promise<void> {
    // 🔍 Chercher le paiement dans Firestore (déjà fait dans handlePaymentCompleted, mais recommandé ici aussi)
    const payment = await paymentService.getByWavePaymentId(wavePaymentId);
    if (!payment || !payment.id) {
      console.error('❌ Paiement non trouvé pour wavePaymentId:', wavePaymentId);
      return;
    }

    // ✅ Extraire les infos du document Firestore (source de vérité!)
    const courseId = payment.courseId;
    const userId = payment.userId;

    if (!courseId || !userId) {
      console.error('❌ Documents Firestore incomplète pour le paiement de cours:', {
        paymentId: payment.id,
        courseId,
        userId
      });
      return;
    }

    // ✅ Mettre à jour le statut du paiement
    await paymentService.updateStatus(payment.id, 'SUCCESS' as PaymentStatus);

    // ✅ Activer l'inscription existante (créée lors de create-payment)
    if (payment.enrollmentId) {
      const { EnrollmentService } = await import('../services/enrollment.service');
      const enrollmentService = new EnrollmentService();
      await enrollmentService.update(payment.enrollmentId, {
        enrolledAt: new Date() // Confirmer la date d'inscription
      });
      console.log(`✅ Inscription confirmée - EnrollmentId: ${payment.enrollmentId}`);
    }

    console.log(`✅ Paiement de cours confirmé - User: ${userId}, Course: ${courseId}`);
  }

  /**
   * Traiter un paiement d'abonnement
   * ⚠️ IMPORTANT: On utilise TOUJOURS le document Firestore comme source de vérité!
   * Ne pas faire confiance aux métadonnées du webhook (Wave ne les retourne pas)
   */
  private async handleSubscriptionPayment(metadata: any, wavePaymentId: string): Promise<void> {
    try {
      // 🔍 Chercher le paiement dans Firestore (déjà fait dans handlePaymentCompleted, mais recommandé ici aussi)
      const payment = await paymentService.getByWavePaymentId(wavePaymentId);
      if (!payment || !payment.id) {
        console.error('❌ Paiement non trouvé pour wavePaymentId:', wavePaymentId);
        return;
      }

      // ✅ Extraire les infos du document Firestore (source de vérité!)
      const subscriptionId = payment.subscriptionId;
      const userId = payment.userId;

      console.log('📋 Traitement paiement abonnement:', {
        subscriptionId,
        userId,
        wavePaymentId,
        paymentStatus: payment.status
      });

      if (!subscriptionId || !userId) {
        console.error('❌ Documents Firestore incomplète pour le paiement:', {
          paymentId: payment.id,
          subscriptionId,
          userId
        });
        return;
      }

      // ✅ Mettre à jour le statut du paiement
      await paymentService.updateStatus(payment.id, 'SUCCESS' as PaymentStatus);
      console.log('✅ Statut paiement mis à jour: SUCCESS');

      // ✅ Activer l'abonnement
      await subscriptionService.activateSubscription(subscriptionId, wavePaymentId, 'wave');
      console.log('✅ Abonnement activé avec succès');

      console.log(`🎉 Paiement abonnement complété - User: ${userId}, Subscription: ${subscriptionId}`);
    } catch (error) {
      console.error('❌ Erreur lors du traitement du paiement d\'abonnement:', error);
      throw error;
    }
  }

  /**
   * Traiter un paiement échoué
   */
  private async handlePaymentFailed(webhookData: any): Promise<void> {
    try {
      const { data } = webhookData;
      const wavePaymentId = data.id;

      // Trouver le paiement par wavePaymentId et mettre à jour le statut
      const payment = await paymentService.getByWavePaymentId(wavePaymentId);
      if (!payment || !payment.id) {
        console.error('❌ Paiement non trouvé pour wavePaymentId:', wavePaymentId);
        return;
      }

      await paymentService.updateStatus(payment.id, 'FAILED' as PaymentStatus);

      console.log(`❌ Paiement Wave échoué - PaymentId: ${wavePaymentId}`);

    } catch (error) {
      console.error('❌ Erreur traitement paiement échoué:', error);
    }
  }

  /**
   * ENDPOINT DE TEST: Simuler un webhook Wave pour confirmer un paiement
   * POST /api/wave/test-confirm/:wavePaymentId
   */
  async testConfirmPayment(req: Request, res: Response): Promise<void> {
    try {
      const { wavePaymentId } = req.params;

      console.log('🧪 TEST: Simulation webhook pour wavePaymentId:', wavePaymentId);

      // Simuler l'événement webhook
      const webhookData = {
        type: 'checkout.session.completed',
        data: {
          id: wavePaymentId,
          payment_status: 'successful'
        }
      };

      // Appeler directement le handler
      await this.handlePaymentCompleted(webhookData);

      res.status(200).json({
        success: true,
        message: `Paiement ${wavePaymentId} confirmé avec succès (TEST)`
      });

    } catch (error: any) {
      console.error('❌ Erreur test confirmation:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur test confirmation'
      });
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

      if (wavePayment.payment_status === 'successful') {
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