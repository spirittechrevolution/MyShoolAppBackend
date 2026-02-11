/**
 * Service d'intégration Wave pour les paiements
 * Documentation: https://docs.wave.com/
 */

import axios, { AxiosResponse } from 'axios';

/**
 * Interface pour une transaction Wave
 */
export interface WaveTransaction {
  id?: string;
  amount: number;
  currency: string;
  customer_email?: string;
  customer_firstname?: string;
  customer_lastname?: string;
  redirect_url?: string;
  cancel_url?: string;
  webhook_url?: string;
  payment_method?: string;
  description?: string;
  metadata?: {
    [key: string]: any;
  };
}

/**
 * Interface pour la réponse Wave
 */
export interface WavePaymentResponse {
  id: string;
  checkout_status: 'pending' | 'successful' | 'cancelled' | 'failed';
  client_reference?: string;
  payment_status: string;
  checkout_url: string;
  amount: number;
  currency: string;
  payment_method: string;
  when_created: string;
  when_completed?: string;
  receipt_url?: string;
  customer?: {
    email: string;
    first_name: string;
    last_name: string;
  };
}

/**
 * Service Wave pour la gestion des paiements
 */
export class WaveService {
  private apiKey: string;
  private baseUrl: string;
  private webhookSecret: string;

  constructor() {
    this.apiKey = process.env.WAVE_API_KEY || '';
    this.webhookSecret = process.env.WAVE_WEBHOOK_SECRET || '';
    
    // URL de base selon l'environnement
    this.baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://api.wave.com/v1'
      : 'https://api.wave.com/v1'; // Wave utilise la même URL pour prod et test
      
    if (!this.apiKey) {
      console.warn('⚠️ WAVE_API_KEY non configurée. Les paiements Wave seront désactivés.');
    }
  }

  /**
   * Créer une transaction de paiement Wave
   */
  async createPayment(transactionData: WaveTransaction): Promise<WavePaymentResponse> {
    try {
      console.log('💳 Création d\'un paiement Wave:', transactionData);

      const response: AxiosResponse<WavePaymentResponse> = await axios.post(
        `${this.baseUrl}/checkout/sessions`,
        {
          amount: transactionData.amount,
          currency: transactionData.currency || 'XOF', // Franc CFA par défaut
          success_url: transactionData.redirect_url,
          cancel_url: transactionData.cancel_url,
          webhook_url: transactionData.webhook_url,
          customer_email: transactionData.customer_email,
          customer_firstname: transactionData.customer_firstname,
          customer_lastname: transactionData.customer_lastname,
          description: transactionData.description,
          metadata: transactionData.metadata
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Paiement Wave créé:', response.data.id);
      return response.data;

    } catch (error: any) {
      console.error('❌ Erreur création paiement Wave:', error.response?.data || error.message);
      throw new Error(`Erreur Wave: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Vérifier le statut d'un paiement
   */
  async getPaymentStatus(paymentId: string): Promise<WavePaymentResponse> {
    try {
      const response: AxiosResponse<WavePaymentResponse> = await axios.get(
        `${this.baseUrl}/checkout/sessions/${paymentId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('❌ Erreur récupération statut Wave:', error.response?.data || error.message);
      throw new Error(`Erreur Wave: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Valider une signature webhook Wave
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    try {
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(payload)
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
    } catch (error) {
      console.error('❌ Erreur validation signature Wave:', error);
      return false;
    }
  }

  /**
   * Créer le paiement pour un cours
   */
  async createCoursePayment(courseId: string, userId: string, userInfo: {
    email?: string;
    firstName?: string;
    lastName?: string;
  }): Promise<{ paymentUrl: string; paymentId: string; amount: number }> {
    try {
      // Import dynamique pour éviter les dépendances circulaires
      const { CourseService } = await import('./course.service');
      const courseService = new CourseService();
      
      // Récupérer les informations du cours
      const course = await courseService.getById(courseId);
      if (!course) {
        throw new Error('Cours non trouvé');
      }

      if (!course.price || course.price <= 0) {
        throw new Error('Prix du cours invalide');
      }

      // URLs de redirection
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? 'https://myschool-app.com' 
        : 'http://localhost:4200';

      const transaction: WaveTransaction = {
        amount: course.price,
        currency: 'XOF',
        customer_email: userInfo.email,
        customer_firstname: userInfo.firstName,
        customer_lastname: userInfo.lastName,
        description: `Achat du cours: ${course.title}`,
        redirect_url: `${baseUrl}/payment/success?courseId=${courseId}&userId=${userId}`,
        cancel_url: `${baseUrl}/payment/cancel?courseId=${courseId}`,
        webhook_url: `${process.env.API_BASE_URL || 'http://localhost:3000'}/api/wave/webhook`,
        metadata: {
          courseId: courseId,
          userId: userId,
          type: 'course_purchase'
        }
      };

      const payment = await this.createPayment(transaction);

      return {
        paymentUrl: payment.checkout_url,
        paymentId: payment.id,
        amount: course.price
      };

    } catch (error: any) {
      console.error('❌ Erreur création paiement cours:', error);
      throw error;
    }
  }
}

export const waveService = new WaveService();