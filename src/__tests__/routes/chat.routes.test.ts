/**
 * Tests pour les routes Chat AI
 */

import request from 'supertest';
import app from '../../server';

describe('Chat AI Routes', () => {
  const testUserId = 'test-user-chat';

  describe('POST /api/chat/ask', () => {
    it('devrait répondre à une question', async () => {
      const response = await request(app)
        .post('/api/chat/ask')
        .send({
          userId: testUserId,
          question: 'Comment payer un cours ?',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.answer).toBeDefined();
      expect(response.body.data.source).toBeDefined();
      expect(['faq', 'ai']).toContain(response.body.data.source);
    });

    it('devrait retourner 400 sans userId', async () => {
      const response = await request(app)
        .post('/api/chat/ask')
        .send({
          question: 'Test question',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('devrait retourner 400 sans question', async () => {
      const response = await request(app)
        .post('/api/chat/ask')
        .send({
          userId: testUserId,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('devrait inclure faqId si source est faq', async () => {
      const response = await request(app)
        .post('/api/chat/ask')
        .send({
          userId: testUserId,
          question: 'paiement',
        })
        .expect(200);

      if (response.body.data.source === 'faq') {
        expect(response.body.data.faqId).toBeDefined();
      }
    });
  });

  describe('GET /api/chat/history/:userId', () => {
    it('devrait récupérer l\'historique de conversation', async () => {
      // D'abord créer une conversation
      await request(app)
        .post('/api/chat/ask')
        .send({
          userId: testUserId,
          question: 'Test question',
        });

      const response = await request(app)
        .get(`/api/chat/history/${testUserId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.userId).toBe(testUserId);
      expect(Array.isArray(response.body.data.messages)).toBe(true);
      expect(response.body.data.messages.length).toBeGreaterThan(0);
    });

    it('devrait retourner 404 si aucune conversation', async () => {
      const response = await request(app)
        .get('/api/chat/history/user-inexistant-xyz')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/chat/feedback', () => {
    it('devrait enregistrer le feedback', async () => {
      const response = await request(app)
        .post('/api/chat/feedback')
        .send({
          userId: testUserId,
          messageIndex: 1,
          helpful: true,
        })
        .expect(200);

      expect(response.body.success).toBeDefined();
      expect(response.body.message).toBeDefined();
    });

    it('devrait retourner 400 sans userId', async () => {
      const response = await request(app)
        .post('/api/chat/feedback')
        .send({
          messageIndex: 0,
          helpful: true,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('devrait retourner 400 sans messageIndex', async () => {
      const response = await request(app)
        .post('/api/chat/feedback')
        .send({
          userId: testUserId,
          helpful: true,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('devrait retourner 400 sans helpful', async () => {
      const response = await request(app)
        .post('/api/chat/feedback')
        .send({
          userId: testUserId,
          messageIndex: 0,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/chat/history/:userId', () => {
    it('devrait supprimer l\'historique', async () => {
      const response = await request(app)
        .delete(`/api/chat/history/${testUserId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Historique supprimé');
    });

    it('devrait fonctionner même si pas d\'historique', async () => {
      const response = await request(app)
        .delete('/api/chat/history/user-sans-historique')
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});
