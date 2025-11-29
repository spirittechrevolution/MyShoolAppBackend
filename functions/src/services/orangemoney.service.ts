/**
 * Service Orange Money (MOCKÉ)
 * 
 * Ce service simule l'API Orange Money Sénégal
 * Documentation: https://developer.orange-sonatel.com/documentation
 * 
 * IMPORTANT: Les données sont mockées car nous n'avons pas encore de clés API
 */

import { PaymentStatus } from '../models/payment.model';

interface OrangeMoneyInitPaymentRequest {
  amount: number;
  currency: string;
  orderReferenceNumber: string;
  customerPhoneNumber: string;
  customerFirstName: string;
  customerLastName: string;
  notifUrl: string;
  returnUrl?: string;
  description?: string;
}

interface OrangeMoneyInitPaymentResponse {
  payToken: string;
  paymentUrl: string;
  orderReferenceNumber: string;
  expiresAt: Date;
}

interface OrangeMoneyCheckPaymentResponse {
  status: PaymentStatus;
  transactionId?: string;
  operatorTransactionId?: string;
  amount: number;
  currency: string;
  completedAt?: Date;
  message?: string;
}

interface OrangeMoneyWebhookPayload {
  status: string;
  txnid: string;
  order_id: string;
  amount: string;
  currency: string;
  payment_method: string;
  timestamp: string;
}

export class OrangeMoneyService {
  // API URLs et configuration
  private static readonly API_BASE_URL = process.env.ORANGE_MONEY_API_URL || 'https://api.orange.com/orange-money-webpay/dev/v1';
  private static readonly PAYMENT_EXPIRY_MINUTES = 15;
  
  // API credentials
  private apiKey: string;
  private merchantKey: string;
  private merchantId: string;
  private notificationUrl: string;
  private returnUrl: string;

  constructor() {
    this.apiKey = process.env.ORANGE_MONEY_API_KEY || '';
    this.merchantKey = process.env.ORANGE_MONEY_MERCHANT_KEY || '';
    this.merchantId = process.env.ORANGE_MONEY_MERCHANT_ID || '';
    this.notificationUrl = process.env.ORANGE_MONEY_NOTIFICATION_URL || '';
    this.returnUrl = process.env.ORANGE_MONEY_RETURN_URL || '';

    // Validation des credentials en mode production/sandbox uniquement
    if (!this.isMockMode() && process.env.NODE_ENV !== 'test' && process.env.FUNCTIONS_EMULATOR !== 'true') {
      if (!this.apiKey || !this.merchantKey || !this.merchantId) {
        console.warn('⚠️ Orange Money: Credentials manquants!');
        console.warn('   Mode MOCK activé par défaut');
        console.warn('   Pour configurer: firebase functions:config:set orangemoney.mode="sandbox"');
        // Ne pas lancer d'erreur pendant le déploiement
      } else {
        console.log('✅ Orange Money configuré en mode:', process.env.ORANGE_MONEY_MODE || 'production');
      }
    } else {
      console.log('🧪 Orange Money configuré en mode MOCK');
    }
  }

  /**
   * Vérifie si le service est en mode MOCK
   * @return {boolean} True si le mode est MOCK ou test
   */
  private isMockMode(): boolean {
    return process.env.ORANGE_MONEY_MODE === 'mock' || process.env.NODE_ENV === 'test';
  }

  /**
   * Initialise un paiement Orange Money
   * @param {OrangeMoneyInitPaymentRequest} request - Les données du paiement
   * @return {Promise<OrangeMoneyInitPaymentResponse>} Réponse avec token et URL de paiement
   */
  async initializePayment(
    request: OrangeMoneyInitPaymentRequest
  ): Promise<OrangeMoneyInitPaymentResponse> {
    // Utiliser le mode MOCK si pas de credentials OU si mode explicite
    if (this.isMockMode() || !this.apiKey || !this.merchantKey || !this.merchantId) {
      return this.mockInitializePayment(request);
    }

    // Validation du numéro de téléphone
    if (!this.validatePhoneNumber(request.customerPhoneNumber)) {
      throw new Error('Numéro de téléphone invalide. Format attendu: +221 77 XXX XX XX');
    }

    try {
      // Appel à l'API Orange Money
      const response = await fetch(`${OrangeMoneyService.API_BASE_URL}/webpayment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          merchant_key: this.merchantKey,
          currency: request.currency,
          order_id: request.orderReferenceNumber,
          amount: request.amount,
          return_url: request.returnUrl || this.returnUrl,
          cancel_url: request.returnUrl || this.returnUrl,
          notif_url: request.notifUrl || this.notificationUrl,
          lang: 'fr',
          reference: request.orderReferenceNumber,
          customer_firstname: request.customerFirstName,
          customer_lastname: request.customerLastName,
          customer_phone_number: this.formatPhoneNumber(request.customerPhoneNumber),
          description: request.description || 'Paiement MySchool'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Orange Money API error: ${error.message || response.statusText}`);
      }

      const data = await response.json();

      // Date d'expiration (15 minutes)
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + OrangeMoneyService.PAYMENT_EXPIRY_MINUTES);

      return {
        payToken: data.pay_token,
        paymentUrl: data.payment_url,
        orderReferenceNumber: request.orderReferenceNumber,
        expiresAt
      };
    } catch (error) {
      console.error('❌ Orange Money initializePayment error:', error);
      throw error;
    }
  }

  /**
   * Vérifie le statut d'un paiement
   * @param {string} payToken - Token du paiement Orange Money
   * @param {string} orderReferenceNumber - Référence de la commande
   * @return {Promise<OrangeMoneyCheckPaymentResponse>} Statut et détails du paiement
   */
  async checkPaymentStatus(
    payToken: string,
    orderReferenceNumber: string
  ): Promise<OrangeMoneyCheckPaymentResponse> {
    // Utiliser le mode MOCK si pas de credentials OU si mode explicite
    if (this.isMockMode() || !this.apiKey || !this.merchantKey || !this.merchantId) {
      return this.mockCheckPaymentStatus(payToken, orderReferenceNumber);
    }

    try {
      const response = await fetch(
        `${OrangeMoneyService.API_BASE_URL}/webpayment/${payToken}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Orange Money API error: ${error.message || response.statusText}`);
      }

      const data = await response.json();

      // Mapper le statut Orange Money vers notre PaymentStatus
      const statusMap: Record<string, PaymentStatus> = {
        'SUCCESS': 'SUCCESS',
        'INITIATED': 'PENDING',
        'PENDING': 'PENDING',
        'FAILED': 'FAILED',
        'CANCELLED': 'CANCELLED',
        'EXPIRED': 'EXPIRED'
      };

      return {
        status: statusMap[data.status] || 'FAILED',
        transactionId: data.txnid,
        operatorTransactionId: data.operator_txn_id,
        amount: parseFloat(data.amount),
        currency: data.currency,
        completedAt: data.payment_date ? new Date(data.payment_date) : undefined,
        message: data.message
      };
    } catch (error) {
      console.error('❌ Orange Money checkPaymentStatus error:', error);
      throw error;
    }
  }

  /**
   * Annule un paiement en attente
   * @param {string} payToken - Token du paiement Orange Money
   * @param {string} orderReferenceNumber - Référence de la commande
   * @return {Promise<{success: boolean, message: string}>} Résultat de l'annulation
   */
  async cancelPayment(
    payToken: string,
    orderReferenceNumber: string
  ): Promise<{ success: boolean; message: string }> {
    if (this.isMockMode()) {
      return this.mockCancelPayment(payToken, orderReferenceNumber);
    }

    try {
      const response = await fetch(
        `${OrangeMoneyService.API_BASE_URL}/webpayment/${payToken}/cancel`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            merchant_key: this.merchantKey,
            order_id: orderReferenceNumber
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Orange Money API error: ${error.message || response.statusText}`);
      }

      const data = await response.json();

      return {
        success: data.status === 'CANCELLED',
        message: data.message || 'Paiement annulé avec succès'
      };
    } catch (error) {
      console.error('❌ Orange Money cancelPayment error:', error);
      throw error;
    }
  }

  /**
   * Traite une notification webhook d'Orange Money
   * @param {OrangeMoneyWebhookPayload} payload - Données du webhook
   * @return {{orderReferenceNumber: string, status: PaymentStatus, transactionId: string, amount: number}} Données traitées
   */
  processWebhook(payload: OrangeMoneyWebhookPayload): {
    orderReferenceNumber: string;
    status: PaymentStatus;
    transactionId: string;
    amount: number;
  } {
    // Map Orange Money status to our PaymentStatus
    const statusMap: Record<string, PaymentStatus> = {
      'SUCCESS': 'SUCCESS',
      'FAILED': 'FAILED',
      'PENDING': 'PENDING',
      'CANCELLED': 'CANCELLED',
      'EXPIRED': 'EXPIRED'
    };

    return {
      orderReferenceNumber: payload.order_id,
      status: statusMap[payload.status] || 'FAILED',
      transactionId: payload.txnid,
      amount: parseFloat(payload.amount)
    };
  }

  /**
   * Génère une référence de commande unique
   * @return {string} Référence au format MS-timestamp-random
   */
  generateOrderReference(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `MS-${timestamp}-${random}`;
  }

  /**
   * Valide un numéro de téléphone sénégalais
   * @param {string} phone - Numéro à valider
   * @return {boolean} True si le numéro est valide
   */
  validatePhoneNumber(phone: string): boolean {
    // Format: +221 77 123 45 67 ou 77 123 45 67 ou 771234567
    const cleanPhone = phone.replace(/[\s-]/g, '');
    const senegalPattern = /^(\+221)?[7][0-8]\d{7}$/;
    return senegalPattern.test(cleanPhone);
  }

  /**
   * Formate un numéro de téléphone au format international
   * @param {string} phone - Numéro à formater
   * @return {string} Numéro au format +221XXXXXXXXX
   */
  formatPhoneNumber(phone: string): string {
    const cleanPhone = phone.replace(/[\s-]/g, '');
    if (cleanPhone.startsWith('+221')) {
      return cleanPhone;
    }
    if (cleanPhone.startsWith('221')) {
      return '+' + cleanPhone;
    }
    return '+221' + cleanPhone;
  }

  // ========== MÉTHODES MOCKÉES ==========

  /**
   * MOCK: Initialise un paiement (simulation)
   * @param {OrangeMoneyInitPaymentRequest} request - Données du paiement
   * @return {Promise<OrangeMoneyInitPaymentResponse>} Réponse simulée
   */
  private async mockInitializePayment(
    request: OrangeMoneyInitPaymentRequest
  ): Promise<OrangeMoneyInitPaymentResponse> {
    console.log('🧪 [MOCK] Initialisation paiement Orange Money:', {
      amount: request.amount,
      phone: request.customerPhoneNumber,
      reference: request.orderReferenceNumber
    });

    // Validation du numéro de téléphone
    if (!this.validatePhoneNumber(request.customerPhoneNumber)) {
      throw new Error('Numéro de téléphone invalide. Format attendu: +221 77 XXX XX XX');
    }

    // Simulation d'un délai réseau
    await this.mockDelay(500);

    // Génération d'un token mocké
    const payToken = `MOCK_TOKEN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // URL de paiement mockée
    const paymentUrl = `https://mock-orange-money.example.com/pay/${payToken}`;
    
    // Date d'expiration (15 minutes)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + OrangeMoneyService.PAYMENT_EXPIRY_MINUTES);

    return {
      payToken,
      paymentUrl,
      orderReferenceNumber: request.orderReferenceNumber,
      expiresAt
    };
  }

  /**
   * MOCK: Vérifie le statut d'un paiement (simulation)
   * @param {string} payToken - Token du paiement
   * @param {string} orderReferenceNumber - Référence de la commande
   * @return {Promise<OrangeMoneyCheckPaymentResponse>} Statut simulé
   */
  private async mockCheckPaymentStatus(
    payToken: string,
    orderReferenceNumber: string
  ): Promise<OrangeMoneyCheckPaymentResponse> {
    console.log('🧪 [MOCK] Vérification statut paiement:', {
      payToken,
      orderReferenceNumber
    });

    // Simulation d'un délai réseau
    await this.mockDelay(300);

    // Simulation: 70% de succès, 20% en attente, 10% échec
    const random = Math.random();
    
    if (random < 0.7) {
      // SUCCESS
      return {
        status: 'SUCCESS',
        transactionId: `TXN_${Date.now()}`,
        operatorTransactionId: `OP_${Math.random().toString(36).substr(2, 12).toUpperCase()}`,
        amount: 0, // Sera remplacé par le montant réel
        currency: 'XOF',
        completedAt: new Date(),
        message: 'Paiement effectué avec succès'
      };
    } else if (random < 0.9) {
      // PENDING
      return {
        status: 'PENDING',
        amount: 0,
        currency: 'XOF',
        message: 'Paiement en attente de confirmation'
      };
    } else {
      // FAILED
      return {
        status: 'FAILED',
        amount: 0,
        currency: 'XOF',
        message: 'Paiement échoué. Veuillez réessayer.'
      };
    }
  }

  /**
   * MOCK: Annule un paiement (simulation)
   * @param {string} payToken - Token du paiement
   * @param {string} orderReferenceNumber - Référence de la commande
   * @return {Promise<{success: boolean, message: string}>} Résultat simulé
   */
  private async mockCancelPayment(
    payToken: string,
    orderReferenceNumber: string
  ): Promise<{ success: boolean; message: string }> {
    console.log('🧪 [MOCK] Annulation paiement:', {
      payToken,
      orderReferenceNumber
    });

    // Simulation d'un délai réseau
    await this.mockDelay(200);

    return {
      success: true,
      message: 'Paiement annulé avec succès'
    };
  }

  /**
   * Simule un délai réseau
   * @param {number} ms - Durée en millisecondes
   * @return {Promise<void>} Promise résolue après le délai
   */
  private mockDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Génère un webhook mocké pour les tests
   * @param {string} orderReferenceNumber - Référence de la commande
   * @param {'SUCCESS' | 'FAILED'} status - Statut du paiement
   * @param {number} amount - Montant du paiement
   * @return {OrangeMoneyWebhookPayload} Payload du webhook mocké
   */
  static generateMockWebhook(
    orderReferenceNumber: string,
    status: 'SUCCESS' | 'FAILED' = 'SUCCESS',
    amount: number = 10000
  ): OrangeMoneyWebhookPayload {
    return {
      status,
      txnid: `TXN_${Date.now()}`,
      order_id: orderReferenceNumber,
      amount: amount.toString(),
      currency: 'XOF',
      payment_method: 'orange_money',
      timestamp: new Date().toISOString()
    };
  }
}
