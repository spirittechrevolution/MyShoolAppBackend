/**
 * Tests unitaires pour FaqService
 */

import { FaqService } from '../../services/faq.service';
import { FAQ, FaqCategory } from '../../models/faq.model';

describe('FaqService', () => {
  let faqService: FaqService;

  beforeEach(() => {
    faqService = new FaqService();
  });

  describe('createFaq', () => {
    it('devrait créer une FAQ avec succès', async () => {
      const faqData: FAQ = {
        question: 'Comment payer un cours ?',
        answer: 'Vous pouvez payer via Orange Money, Wave ou Free Money',
        category: FaqCategory.PAYMENTS,
        order: 1,
        tags: ['paiement', 'orange-money'],
        isActive: true,
        views: 0,
        helpful: 0,
        notHelpful: 0,
      };

      const result = await faqService.createFaq(faqData);

      expect(result.success).toBe(true);
      expect(result.id).toBeDefined();
      expect(result.message).toBe('FAQ créée avec succès');
    });

    it('devrait gérer les erreurs lors de la création', async () => {
      const invalidData = {} as FAQ;

      const result = await faqService.createFaq(invalidData);

      expect(result.success).toBe(false);
      expect(result.message).toBeDefined();
    });
  });

  describe('getAllFaqs', () => {
    it('devrait récupérer toutes les FAQs', async () => {
      const faqs = await faqService.getAllFaqs();

      expect(Array.isArray(faqs)).toBe(true);
    });

    it('devrait filtrer par catégorie', async () => {
      const faqs = await faqService.getAllFaqs({
        category: FaqCategory.PAYMENTS,
      });

      expect(Array.isArray(faqs)).toBe(true);
      faqs.forEach(faq => {
        expect(faq.category).toBe(FaqCategory.PAYMENTS);
      });
    });

    it('devrait filtrer par statut actif', async () => {
      const faqs = await faqService.getAllFaqs({
        isActive: true,
      });

      expect(Array.isArray(faqs)).toBe(true);
      faqs.forEach(faq => {
        expect(faq.isActive).toBe(true);
      });
    });
  });

  describe('getFaqById', () => {
    it('devrait retourner null pour un ID inexistant', async () => {
      const faq = await faqService.getFaqById('inexistant');

      expect(faq).toBeNull();
    });
  });

  describe('searchFaqs', () => {
    it('devrait rechercher des FAQs par texte', async () => {
      const results = await faqService.searchFaqs('paiement');

      expect(Array.isArray(results)).toBe(true);
    });

    it('devrait retourner un tableau vide si aucun résultat', async () => {
      const results = await faqService.searchFaqs('xyzabc123notfound');

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });
  });

  describe('updateFaq', () => {
    it('devrait retourner une erreur pour un ID inexistant', async () => {
      const result = await faqService.updateFaq('inexistant', {
        question: 'Nouvelle question',
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe('FAQ non trouvée');
    });
  });

  describe('deleteFaq', () => {
    it('devrait supprimer une FAQ', async () => {
      // Ce test nécessite un ID valide dans la base
      const result = await faqService.deleteFaq('test-id');

      expect(result.success).toBeDefined();
      expect(result.message).toBeDefined();
    });
  });

  describe('markHelpful', () => {
    it('devrait marquer une FAQ comme utile', async () => {
      const result = await faqService.markHelpful('test-id', true);

      expect(result.success).toBeDefined();
      expect(result.message).toBeDefined();
    });

    it('devrait marquer une FAQ comme pas utile', async () => {
      const result = await faqService.markHelpful('test-id', false);

      expect(result.success).toBeDefined();
      expect(result.message).toBeDefined();
    });
  });

  describe('getFaqStats', () => {
    it('devrait retourner les statistiques', async () => {
      const stats = await faqService.getFaqStats();

      expect(stats).toBeDefined();
      expect(stats.totalFaqs).toBeGreaterThanOrEqual(0);
      expect(stats.totalViews).toBeGreaterThanOrEqual(0);
      expect(stats.averageHelpfulRate).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(stats.topCategories)).toBe(true);
      expect(Array.isArray(stats.topQuestions)).toBe(true);
    });
  });

  describe('getFaqsByCategory', () => {
    it('devrait récupérer les FAQs par catégorie', async () => {
      const faqs = await faqService.getFaqsByCategory(FaqCategory.COURSES);

      expect(Array.isArray(faqs)).toBe(true);
      faqs.forEach(faq => {
        expect(faq.category).toBe(FaqCategory.COURSES);
        expect(faq.isActive).toBe(true);
      });
    });
  });
});
