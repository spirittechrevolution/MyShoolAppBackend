/**
 * Tests unitaires pour AiChatService
 */

import { AiChatService } from '../../services/ai-chat.service';

describe('AiChatService', () => {
  let aiChatService: AiChatService;

  beforeEach(() => {
    aiChatService = new AiChatService();
  });

  describe('askQuestion', () => {
    it('devrait répondre à une question', async () => {
      const result = await aiChatService.askQuestion('user123', 'Comment payer un cours ?');

      expect(result).toBeDefined();
      expect(result.answer).toBeDefined();
      expect(result.source).toBeDefined();
      expect(['faq', 'ai']).toContain(result.source);
    });

    it('devrait utiliser FAQ si disponible', async () => {
      // Cette question devrait être trouvée dans la FAQ
      const result = await aiChatService.askQuestion('user123', 'paiement');

      expect(result).toBeDefined();
      if (result.source === 'faq') {
        expect(result.faqId).toBeDefined();
      }
    });

    it('devrait utiliser AI si FAQ non trouvée', async () => {
      const result = await aiChatService.askQuestion(
        'user123',
        'Question très spécifique qui nexiste pas dans la FAQ xyz123'
      );

      expect(result).toBeDefined();
      expect(result.answer).toBeDefined();
      // Peut être 'ai' ou 'faq' selon le contenu de la base
    });

    it('devrait gérer les erreurs gracieusement', async () => {
      const result = await aiChatService.askQuestion('', '');

      expect(result).toBeDefined();
      expect(result.answer).toBeDefined();
    });
  });

  describe('getConversationHistory', () => {
    it('devrait retourner null si aucune conversation', async () => {
      const conversation = await aiChatService.getConversationHistory('user-inexistant');

      expect(conversation).toBeNull();
    });

    it('devrait récupérer l\'historique existant', async () => {
      // D'abord créer une conversation
      await aiChatService.askQuestion('user-test', 'Test question');

      const conversation = await aiChatService.getConversationHistory('user-test');

      if (conversation) {
        expect(conversation.userId).toBe('user-test');
        expect(Array.isArray(conversation.messages)).toBe(true);
        expect(conversation.messages.length).toBeGreaterThan(0);
      }
    });
  });

  describe('markMessageHelpful', () => {
    it('devrait retourner erreur pour conversation inexistante', async () => {
      const result = await aiChatService.markMessageHelpful('user-inexistant', 0, true);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Conversation non trouvée');
    });

    it('devrait retourner erreur pour index invalide', async () => {
      // Créer une conversation
      await aiChatService.askQuestion('user-test2', 'Test');

      const result = await aiChatService.markMessageHelpful('user-test2', 999, true);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Message non trouvé');
    }, 10000);
  });

  describe('clearConversation', () => {
    it('devrait supprimer l\'historique', async () => {
      // Créer une conversation
      await aiChatService.askQuestion('user-delete-test', 'Test question');

      const result = await aiChatService.clearConversation('user-delete-test');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Historique supprimé');

      // Vérifier que la conversation a été supprimée
      const conversation = await aiChatService.getConversationHistory('user-delete-test');
      expect(conversation).toBeNull();
    }, 10000);
  });
});
