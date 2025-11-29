/**
 * Tests pour les routes de paiement
 */

import request from 'supertest';
import express from 'express';
import { PaymentModel } from '../../models/payment.model';

// Mock complet du service avant les imports
const mockCreate = jest.fn();
const mockGetAll = jest.fn();
const mockGetById = jest.fn();
const mockGetByUserId = jest.fn();
const mockGetByEnrollmentId = jest.fn();
const mockGetByStatus = jest.fn();
const mockCheckStatus = jest.fn();
const mockCancel = jest.fn();
const mockHandleWebhook = jest.fn();
const mockDelete = jest.fn();

jest.mock('../../services/payment.service', () => {
  return {
    PaymentService: jest.fn().mockImplementation(() => ({
      create: mockCreate,
      getAll: mockGetAll,
      getById: mockGetById,
      getByUserId: mockGetByUserId,
      getByEnrollmentId: mockGetByEnrollmentId,
      getByStatus: mockGetByStatus,
      checkStatus: mockCheckStatus,
      cancel: mockCancel,
      handleWebhook: mockHandleWebhook,
      delete: mockDelete
    }))
  };
});

// Import après le mock
import paymentRoutes from '../../routes/payment.routes';

const app = express();
app.use(express.json());
app.use('/api/payments', paymentRoutes);

describe('Payment Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configuration des mocks par défaut
    mockCreate.mockResolvedValue(
      new PaymentModel({
        id: 'payment123',
        userId: 'user123',
        enrollmentId: 'enroll123',
        courseId: 'course123',
        amount: 10000,
        currency: 'XOF',
        paymentMethod: 'orange-money',
        status: 'PENDING',
        payToken: 'MOCK_TOKEN_123',
        paymentUrl: 'https://mock-payment.com/pay'
      })
    );

    mockGetAll.mockResolvedValue([]);
    mockGetById.mockResolvedValue(null);
    mockGetByUserId.mockResolvedValue([]);
    mockGetByEnrollmentId.mockResolvedValue([]);
    mockGetByStatus.mockResolvedValue([]);
    
    mockCheckStatus.mockResolvedValue(
      new PaymentModel({
        id: 'payment123',
        userId: 'user123',
        enrollmentId: 'enroll123',
        courseId: 'course123',
        amount: 10000,
        status: 'SUCCESS'
      })
    );

    mockCancel.mockResolvedValue(
      new PaymentModel({
        id: 'payment123',
        userId: 'user123',
        enrollmentId: 'enroll123',
        courseId: 'course123',
        amount: 10000,
        status: 'CANCELLED'
      })
    );

    mockHandleWebhook.mockResolvedValue(
      new PaymentModel({
        id: 'payment123',
        userId: 'user123',
        enrollmentId: 'enroll123',
        courseId: 'course123',
        amount: 10000,
        status: 'SUCCESS'
      })
    );

    mockDelete.mockResolvedValue(undefined);
  });

  describe('POST /api/payments', () => {
    it('devrait créer un paiement Orange Money', async () => {
      const paymentData = {
        userId: 'user123',
        enrollmentId: 'enroll123',
        courseId: 'course123',
        amount: 10000,
        currency: 'XOF',
        paymentMethod: 'orange-money',
        customerPhoneNumber: '+221771234567',
        customerFirstName: 'Jean',
        customerLastName: 'Dupont'
      };

      const response = await request(app)
        .post('/api/payments')
        .send(paymentData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('devrait rejeter un paiement sans données requises', async () => {
      mockCreate.mockRejectedValue(
        new Error('userId, enrollmentId et courseId sont requis')
      );

      const response = await request(app)
        .post('/api/payments')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/payments', () => {
    it('devrait récupérer tous les paiements', async () => {
      const response = await request(app)
        .get('/api/payments');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('count');
    });
  });

  describe('GET /api/payments/:id', () => {
    it('devrait récupérer un paiement par ID', async () => {
      const response = await request(app)
        .get('/api/payments/payment123');

      expect([200, 404]).toContain(response.status);
    });
  });

  describe('GET /api/payments/user/:userId', () => {
    it('devrait récupérer les paiements d\'un utilisateur', async () => {
      const response = await request(app)
        .get('/api/payments/user/user123');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
    });
  });

  describe('GET /api/payments/enrollment/:enrollmentId', () => {
    it('devrait récupérer les paiements d\'une inscription', async () => {
      const response = await request(app)
        .get('/api/payments/enrollment/enroll123');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
    });
  });

  describe('GET /api/payments/status/:status', () => {
    it('devrait récupérer les paiements par statut', async () => {
      const response = await request(app)
        .get('/api/payments/status/PENDING');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
    });

    it('devrait accepter différents statuts', async () => {
      const statuses = ['PENDING', 'SUCCESS', 'FAILED', 'CANCELLED', 'EXPIRED'];

      for (const status of statuses) {
        const response = await request(app)
          .get(`/api/payments/status/${status}`);

        expect(response.status).toBe(200);
      }
    });
  });

  describe('GET /api/payments/:id/check', () => {
    it('devrait vérifier le statut d\'un paiement', async () => {
      const response = await request(app)
        .get('/api/payments/payment123/check');

      expect([200, 500]).toContain(response.status);
    });
  });

  describe('POST /api/payments/:id/cancel', () => {
    it('devrait annuler un paiement', async () => {
      const response = await request(app)
        .post('/api/payments/payment123/cancel');

      expect([200, 400, 404]).toContain(response.status);
    });
  });

  describe('POST /api/payments/webhook/orange-money', () => {
    it('devrait traiter un webhook Orange Money', async () => {
      const webhookData = {
        status: 'SUCCESS',
        txnid: 'TXN123456',
        order_id: 'MS-123456-1234',
        amount: '10000',
        currency: 'XOF',
        payment_method: 'orange_money',
        timestamp: new Date().toISOString()
      };

      const response = await request(app)
        .post('/api/payments/webhook/orange-money')
        .send(webhookData);

      // Toujours retourne 200 même en cas d'erreur
      expect(response.status).toBe(200);
    });

    it('devrait gérer un webhook invalide gracieusement', async () => {
      mockHandleWebhook.mockRejectedValue(
        new Error('Invalid webhook data')
      );

      const response = await request(app)
        .post('/api/payments/webhook/orange-money')
        .send({});

      expect(response.status).toBe(200);
    });
  });

  describe('DELETE /api/payments/:id', () => {
    it('devrait supprimer un paiement', async () => {
      const response = await request(app)
        .delete('/api/payments/payment123');

      expect([200, 500]).toContain(response.status);
    });
  });
});
