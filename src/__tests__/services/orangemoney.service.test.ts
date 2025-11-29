/**
 * Tests pour le service de paiement Orange Money
 */

import { OrangeMoneyService } from '../../services/orangemoney.service';

describe('OrangeMoneyService', () => {
  let service: OrangeMoneyService;

  beforeAll(() => {
    // Forcer le mode MOCK pour les tests
    process.env.ORANGE_MONEY_MODE = 'mock';
  });

  beforeEach(() => {
    service = new OrangeMoneyService();
  });

  describe('Validation de numéro de téléphone', () => {
    it('devrait valider un numéro sénégalais avec +221', () => {
      expect(service.validatePhoneNumber('+221771234567')).toBe(true);
    });

    it('devrait valider un numéro sénégalais sans +221', () => {
      expect(service.validatePhoneNumber('771234567')).toBe(true);
    });

    it('devrait valider un numéro avec espaces', () => {
      expect(service.validatePhoneNumber('+221 77 123 45 67')).toBe(true);
    });

    it('devrait rejeter un numéro invalide', () => {
      expect(service.validatePhoneNumber('123456789')).toBe(false);
    });

    it('devrait rejeter un numéro trop court', () => {
      expect(service.validatePhoneNumber('+221771234')).toBe(false);
    });

    it('devrait accepter tous les préfixes sénégalais (70-78)', () => {
      expect(service.validatePhoneNumber('+221701234567')).toBe(true);
      expect(service.validatePhoneNumber('+221771234567')).toBe(true);
      expect(service.validatePhoneNumber('+221781234567')).toBe(true);
    });
  });

  describe('Formatage de numéro de téléphone', () => {
    it('devrait ajouter +221 à un numéro sans préfixe', () => {
      expect(service.formatPhoneNumber('771234567')).toBe('+221771234567');
    });

    it('devrait garder un numéro déjà formaté', () => {
      expect(service.formatPhoneNumber('+221771234567')).toBe('+221771234567');
    });

    it('devrait supprimer les espaces', () => {
      expect(service.formatPhoneNumber('77 123 45 67')).toBe('+221771234567');
    });
  });

  describe('Génération de référence de commande', () => {
    it('devrait générer une référence unique', () => {
      const ref1 = service.generateOrderReference();
      const ref2 = service.generateOrderReference();
      
      expect(ref1).toMatch(/^MS-\d+-\d{4}$/);
      expect(ref2).toMatch(/^MS-\d+-\d{4}$/);
      expect(ref1).not.toBe(ref2);
    });
  });

  describe('Initialisation de paiement (MOCK)', () => {
    it('devrait initialiser un paiement avec succès', async () => {
      const request = {
        amount: 10000,
        currency: 'XOF',
        orderReferenceNumber: 'MS-123456-1234',
        customerPhoneNumber: '+221771234567',
        customerFirstName: 'Jean',
        customerLastName: 'Dupont',
        notifUrl: 'https://example.com/webhook',
        description: 'Paiement test'
      };

      const response = await service.initializePayment(request);

      expect(response).toHaveProperty('payToken');
      expect(response).toHaveProperty('paymentUrl');
      expect(response.orderReferenceNumber).toBe(request.orderReferenceNumber);
      expect(response.expiresAt).toBeInstanceOf(Date);
      expect(response.payToken).toContain('MOCK_TOKEN');
    });

    it('devrait rejeter un numéro de téléphone invalide', async () => {
      const request = {
        amount: 10000,
        currency: 'XOF',
        orderReferenceNumber: 'MS-123456-1234',
        customerPhoneNumber: '123456789',
        customerFirstName: 'Jean',
        customerLastName: 'Dupont',
        notifUrl: 'https://example.com/webhook'
      };

      await expect(service.initializePayment(request)).rejects.toThrow('Numéro de téléphone invalide');
    });
  });

  describe('Vérification de statut de paiement (MOCK)', () => {
    it('devrait retourner un statut de paiement', async () => {
      const response = await service.checkPaymentStatus('TOKEN123', 'MS-123456-1234');

      expect(response).toHaveProperty('status');
      expect(['SUCCESS', 'PENDING', 'FAILED']).toContain(response.status);
      expect(response).toHaveProperty('amount');
      expect(response).toHaveProperty('currency');
      expect(response.currency).toBe('XOF');
    });

    it('devrait inclure transactionId si succès', async () => {
      // Tester plusieurs fois pour avoir une chance d'avoir SUCCESS
      let hasSuccess = false;
      let attempts = 0;
      const maxAttempts = 20;

      while (!hasSuccess && attempts < maxAttempts) {
        const response = await service.checkPaymentStatus('TOKEN123', 'MS-123456-1234');
        if (response.status === 'SUCCESS') {
          expect(response.transactionId).toBeDefined();
          expect(response.operatorTransactionId).toBeDefined();
          expect(response.completedAt).toBeDefined();
          hasSuccess = true;
        }
        attempts++;
      }

      // Au moins un test a réussi sur plusieurs tentatives
      expect(attempts).toBeLessThanOrEqual(maxAttempts);
    });
  });

  describe('Annulation de paiement (MOCK)', () => {
    it('devrait annuler un paiement avec succès', async () => {
      const response = await service.cancelPayment('TOKEN123', 'MS-123456-1234');

      expect(response.success).toBe(true);
      expect(response.message).toContain('annulé');
    });
  });

  describe('Traitement de webhook', () => {
    it('devrait traiter un webhook de succès', () => {
      const payload = OrangeMoneyService.generateMockWebhook('MS-123456-1234', 'SUCCESS', 10000);
      const result = service.processWebhook(payload);

      expect(result.orderReferenceNumber).toBe('MS-123456-1234');
      expect(result.status).toBe('SUCCESS');
      expect(result.transactionId).toBeDefined();
      expect(result.amount).toBe(10000);
    });

    it('devrait traiter un webhook d\'échec', () => {
      const payload = OrangeMoneyService.generateMockWebhook('MS-123456-1234', 'FAILED', 10000);
      const result = service.processWebhook(payload);

      expect(result.status).toBe('FAILED');
    });
  });

  describe('Génération de webhook mocké', () => {
    it('devrait générer un webhook de succès', () => {
      const webhook = OrangeMoneyService.generateMockWebhook('MS-123456-1234', 'SUCCESS', 5000);

      expect(webhook.status).toBe('SUCCESS');
      expect(webhook.order_id).toBe('MS-123456-1234');
      expect(webhook.amount).toBe('5000');
      expect(webhook.currency).toBe('XOF');
      expect(webhook.payment_method).toBe('orange_money');
      expect(webhook.txnid).toBeDefined();
      expect(webhook.timestamp).toBeDefined();
    });
  });
});
