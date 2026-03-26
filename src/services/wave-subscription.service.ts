/**
 * Extension du Wave Service pour les paiements d'abonnement - Nouveau modèle classe-based
 */

import { WaveService } from './wave.service';
import { SubscriptionService } from './subscription.service';
import { SUBSCRIPTION_PRICE } from '../models/subscription.model';

export class WaveSubscriptionService extends WaveService {
  private subscriptionService: SubscriptionService;

  constructor() {
    super();
    this.subscriptionService = new SubscriptionService();
  }

  /**
   * Créer un paiement pour un abonnement - Nouveau modèle basé sur classe
   */
  async createSubscriptionPayment(
    typeAbonnement: string,
    userId: string, 
    userInfo: {
      phone?: string;
      firstName?: string;
      lastName?: string;
      classe: string;
      niveauScolaire: string;
      typeAbonnement: string;
      matieres?: string[];
    },
    customAmount?: number
  ): Promise<{ paymentUrl: string; paymentId: string; amount: number; subscriptionId: string }> {
    try {
      const { classe, niveauScolaire, typeAbonnement, matieres } = userInfo;

      if (!classe || !niveauScolaire || !typeAbonnement) {
        throw new Error('classe, niveauScolaire et typeAbonnement sont requis');
      }

      // Validation du type d'abonnement
      if (typeAbonnement === 'CLASSE' && niveauScolaire !== 'ELEMENTAIRE') {
        throw new Error('Le type d\'abonnement CLASSE est réservé au niveau ELEMENTAIRE');
      }

      if (typeAbonnement === 'MATIERE' && (!matieres || matieres.length !== 3)) {
        throw new Error('L\'abonnement MATIERE nécessite exactement 3 matières');
      }

      // Prix unique ou custom (promo)
      const amount = typeof customAmount === 'number' ? customAmount : SUBSCRIPTION_PRICE;

      // Créer l'abonnement en statut PENDING
      const subscription = await this.subscriptionService.create({
        userId: userId,
        niveauScolaire: niveauScolaire as any,
        typeAbonnement: typeAbonnement as any,
        classe: classe,
        matieres: matieres,
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
        description: `Abonnement annuel - Classe: ${classe}${typeAbonnement === 'MATIERE' ? ' (3 matières)' : ''}`,
        redirect_url: `${baseUrl}/subscription/success?subscriptionId=${subscription.id}&userId=${userId}&classe=${encodeURIComponent(classe)}`,
        cancel_url: `${baseUrl}/subscription/cancel?subscriptionId=${subscription.id}`,
        webhook_url: `${process.env.API_BASE_URL || 'http://localhost:3000'}/api/wave/webhook`,
        metadata: {
          userId: userId,
          subscriptionId: subscription.id,
          classe: classe,
          niveauScolaire: niveauScolaire,
          typeAbonnement: typeAbonnement,
          matieres: matieres || [],
          type: 'subscription_payment'  // Important pour le webhook
        }
      };

      const payment = await this.createPayment(transaction);

      console.log('💰 Paiement Wave créé:', {
        id: payment.id,
        checkoutUrl: payment.checkout_url,
        subscriptionId: subscription.id,
        classe: classe,
        typeAbonnement: typeAbonnement
      });

      return {
        paymentUrl: payment.checkout_url,
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
