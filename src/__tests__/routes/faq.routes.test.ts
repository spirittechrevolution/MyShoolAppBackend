/**
 * Tests pour les routes FAQ
 */

import request from 'supertest';
import app from '../../server';
import { FaqCategory } from '../../models/faq.model';

describe('FAQ Routes', () => {
  let createdFaqId: string;

  describe('POST /api/faqs', () => {
    it('devrait créer une nouvelle FAQ', async () => {
      const faqData = {
        question: 'Comment s\'inscrire à un cours ?',
        answer: 'Vous devez d\'abord créer un compte, puis sélectionner le cours de votre choix',
        category: FaqCategory.ENROLLMENT,
        order: 1,
        tags: ['inscription', 'cours'],
        isActive: true,
      };

      const response = await request(app)
        .post('/api/faqs')
        .send(faqData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.id).toBeDefined();
      createdFaqId = response.body.id;
    });

    it('devrait retourner 400 si données invalides', async () => {
      const invalidData = {
        question: 'Question sans réponse',
      };

      const response = await request(app)
        .post('/api/faqs')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/faqs', () => {
    it('devrait récupérer toutes les FAQs', async () => {
      const response = await request(app)
        .get('/api/faqs')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.count).toBeGreaterThanOrEqual(0);
    });

    it('devrait filtrer par catégorie', async () => {
      const response = await request(app)
        .get('/api/faqs?category=payments')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('devrait filtrer par statut actif', async () => {
      const response = await request(app)
        .get('/api/faqs?isActive=true')
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.forEach((faq: any) => {
        expect(faq.isActive).toBe(true);
      });
    });
  });

  describe('GET /api/faqs/search', () => {
    it('devrait rechercher des FAQs', async () => {
      const response = await request(app)
        .get('/api/faqs/search?q=paiement')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('devrait retourner 400 sans paramètre q', async () => {
      const response = await request(app)
        .get('/api/faqs/search')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/faqs/stats', () => {
    it('devrait récupérer les statistiques', async () => {
      const response = await request(app)
        .get('/api/faqs/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalFaqs).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(response.body.data.topCategories)).toBe(true);
    });
  });

  describe('GET /api/faqs/category/:category', () => {
    it('devrait récupérer les FAQs par catégorie', async () => {
      const response = await request(app)
        .get('/api/faqs/category/payments')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/faqs/:id', () => {
    it('devrait retourner 404 pour ID inexistant', async () => {
      const response = await request(app)
        .get('/api/faqs/inexistant')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/faqs/:id', () => {
    it('devrait mettre à jour une FAQ', async () => {
      if (!createdFaqId) {
        return; // Skip si pas de FAQ créée
      }

      const updates = {
        question: 'Question mise à jour',
      };

      const response = await request(app)
        .put(`/api/faqs/${createdFaqId}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('devrait retourner 404 pour ID inexistant', async () => {
      const response = await request(app)
        .put('/api/faqs/inexistant')
        .send({ question: 'Test' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/faqs/:id/helpful', () => {
    it('devrait marquer une FAQ comme utile', async () => {
      if (!createdFaqId) {
        return;
      }

      const response = await request(app)
        .post(`/api/faqs/${createdFaqId}/helpful`)
        .send({ helpful: true })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('devrait retourner 400 sans champ helpful', async () => {
      const response = await request(app)
        .post('/api/faqs/test-id/helpful')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/faqs/:id', () => {
    it('devrait supprimer une FAQ', async () => {
      if (!createdFaqId) {
        return;
      }

      const response = await request(app)
        .delete(`/api/faqs/${createdFaqId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});
