/**
 * Extension du Wave Service pour les paiements d'abonnement
 */

import { WaveService } from './wave.service';
import { SubscriptionService } from './subscription.service';

export class WaveSubscriptionService extends WaveService {
  private subscriptionService: SubscriptionService;

  constructor() {
    super();
    this.subscriptionService = new SubscriptionService();
  }

  /**
   * Créer un paiement pour un abonnement
   */
  async createSubscriptionPayment(
    plan: string, 
    userId: string, 
    userInfo: {
      phone?: string;
      firstName?: string;
      lastName?: string;
    },
    category: string
  ): Promise<{ paymentUrl: string; paymentId: string; amount: number; subscriptionId: string }> {
    try {
      // Vérifier le plan et obtenir le prix
      const validPlans = ['MONTHLY', 'QUARTERLY', 'ANNUAL'];
      if (!validPlans.includes(plan)) {
        throw new Error('Plan d\'abonnement invalide');
      }

      if (!category) {
        throw new Error('Catégorie de cours requise');
      }

      const amount = this.subscriptionService.getPlanPrice(plan as any, category);

      // Créer l'abonnement en statut PENDING
      const subscription = await this.subscriptionService.create({
        userId: userId,
        plan: plan as any,
        category: category,
        status: 'PENDING',
        amount: amount,
        currency: 'XOF'
      });

      // URLs de redirection
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:4200';

      const transaction = {
        amount: amount,
        currency: 'XOF',
        customer_phone: userInfo.phone,
        customer_firstname: userInfo.firstName,
        customer_lastname: userInfo.lastName,
        description: `Abonnement ${plan} - Catégorie: ${category}`,
        redirect_url: `${baseUrl}/subscription/success?subscriptionId=${subscription.id}&userId=${userId}&category=${encodeURIComponent(category)}`,
        cancel_url: `${baseUrl}/subscription/cancel?subscriptionId=${subscription.id}`,
        webhook_url: `${process.env.API_BASE_URL || 'http://localhost:3000'}/api/wave/webhook`,
        metadata: {
          userId: userId,
          plan: plan,
          category: category,
          subscriptionId: subscription.id,
          type: 'subscription_payment'
        }
      };

      const payment = await this.createPayment(transaction);

      console.log('💰 Paiement Wave reçu:', {
        id: payment.id,
        wave_launch_url: payment.wave_launch_url,
        has_wave_launch_url: !!payment.wave_launch_url
      });

      return {
        paymentUrl: payment.wave_launch_url,
        paymentId: payment.id,
        amount: amount,
        subscriptionId: subscription.id!
      };

    } catch (error: any) {
      console.error('❌ Erreur création paiement abonnement:', error);
      throw error;
    }
  }
}

export const waveSubscriptionService = new WaveSubscriptionService();
