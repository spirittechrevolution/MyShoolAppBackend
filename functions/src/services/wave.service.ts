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
  customer_phone?: string;
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
  amount: string;
  checkout_status: 'open' | 'complete' | 'cancelled';
  client_reference?: string | null;
  currency: string;
  error_url: string;
  last_payment_error?: string | null;
  business_name: string;
  payment_status: 'processing' | 'successful' | 'failed';
  success_url: string;
  wave_launch_url: string;  // URL pour rediriger l'utilisateur
  when_completed?: string | null;
  when_created: string;
  when_expires: string;
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
    this.baseUrl = process.env.WAVE_API_BASE_URL || 'https://api.wave.com/v1';
    
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

      // Construction du payload selon la doc Wave
      const payload: any = {
        amount: String(transactionData.amount), // Doit être une string
        currency: transactionData.currency || 'XOF',
        error_url: transactionData.cancel_url || `${process.env.FRONTEND_URL}/payment/error`,
        success_url: transactionData.redirect_url || `${process.env.FRONTEND_URL}/payment/success`
      };

      console.log('📤 Payload Wave:', payload);

      const response: AxiosResponse<WavePaymentResponse> = await axios.post(
        `${this.baseUrl}/checkout/sessions`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Paiement Wave créé:', response.data.id);
      console.log('📋 Réponse Wave complète:', JSON.stringify(response.data, null, 2));
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
verifyWebhookSignature(payload: string, signature: string | undefined): boolean {
  try {
    if (!signature || !this.webhookSecret) {
      console.warn('⚠️ Signature ou webhookSecret manquant');
      return false;
    }

    const crypto = require('crypto');

    // Format Wave: "t=1234567890,v1=abcdef..."
    const parts = signature.split(',');
    const tPart = parts.find(p => p.startsWith('t='));
    const v1Part = parts.find(p => p.startsWith('v1='));

    if (!tPart || !v1Part) {
      console.warn('⚠️ Format signature Wave invalide:', signature);
      return false;
    }

    const timestamp = tPart.split('=')[1];
    const receivedHash = v1Part.split('=')[1];

    // Wave signe: "timestamp.payload"
    const signedPayload = `${timestamp}.${payload}`;

    const expectedHash = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(signedPayload)
      .digest('hex');

    console.log('🔐 Vérification signature Wave:', {
      timestamp,
      receivedHash: receivedHash.substring(0, 10) + '...',
      expectedHash: expectedHash.substring(0, 10) + '...'
    });

    if (receivedHash.length !== expectedHash.length) {
      console.warn('⚠️ Longueur hash incorrecte');
      return false;
    }

    return crypto.timingSafeEqual(
      Buffer.from(receivedHash),
      Buffer.from(expectedHash)
    );

  } catch (error) {
    console.error('❌ Erreur validation signature Wave:', error);
    return false;
  }
}

  /**
   * Créer le paiement pour un cours
   * @param {string} courseId - ID du cours
   * @param {string} userId - ID de l'utilisateur
   * @param {object} userInfo - Infos utilisateur (phone, firstName, lastName)
   * @param {string} promoCode - Code promo appliqué (optionnel)
   * @param {number} finalAmount - Montant final après réductions (optionnel, utilise le prix du cours sinon)
   */
  async createCoursePayment(
    courseId: string, 
    userId: string, 
    userInfo: {
      phone?: string;
      firstName?: string;
      lastName?: string;
    },
    promoCode?: string,
    finalAmount?: number
  ): Promise<{ paymentUrl: string; paymentId: string; amount: number }> {
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

      // Déterminer le montant effectif avec réduction si applicable
      let effectiveAmount = finalAmount || course.price;

      // Validation du montant final
      if (effectiveAmount <= 0) {
        throw new Error('Montant invalide après déduction');
      }

      console.log(`💳 Paiement Wave: montant original=${course.price}, montant final=${effectiveAmount}${promoCode ? `, code promo=${promoCode}` : ''}`);

      // URLs de redirection
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:4200';

      const transaction: WaveTransaction = {
        amount: effectiveAmount,
        currency: 'XOF',
        customer_phone: userInfo.phone,
        customer_firstname: userInfo.firstName,
        customer_lastname: userInfo.lastName,
        description: `Achat du cours: ${course.title}`,
        redirect_url: `${baseUrl}/payment/success?courseId=${courseId}&userId=${userId}`,
        cancel_url: `${baseUrl}/payment/cancel?courseId=${courseId}`,
        webhook_url: `${process.env.API_BASE_URL || 'http://localhost:3000'}/api/wave/webhook`,
        metadata: {
          courseId: courseId,
          userId: userId,
          type: 'course_purchase',
          ...(promoCode && { promoCode: promoCode }),
          originalPrice: course.price,
          ...(finalAmount && finalAmount < course.price && { discountAmount: course.price - finalAmount })
        }
      };

      const payment = await this.createPayment(transaction);

      return {
        paymentUrl: payment.wave_launch_url,
        paymentId: payment.id,
        amount: effectiveAmount
      };

    } catch (error: any) {
      console.error('❌ Erreur création paiement cours:', error);
      throw error;
    }
  }
}

export const waveService = new WaveService();