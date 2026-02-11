/**
 * Controller FAQ pour MySchool
 * Gère les endpoints de la FAQ et du chatbot AI
 */

import { Request, Response } from 'express';
import { FaqService } from '../services/faq.service';
import { AiChatService } from '../services/ai-chat.service';
import { FAQ, FaqCategory, FaqSearchQuery } from '../models/faq.model';

export class FaqController {
  private faqService: FaqService;
  private aiChatService: AiChatService;

  constructor() {
    this.faqService = new FaqService();
    this.aiChatService = new AiChatService();
  }

  /**
   * Créer une nouvelle FAQ
   * POST /api/faqs
   * @param {Request} req - Requête
   * @param {Response} res - Réponse
   * @return {Promise<void>} Résultat
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const faqData: FAQ = req.body;

      // Validation
      if (!faqData.question || !faqData.answer || !faqData.category) {
        res.status(400).json({
          success: false,
          message: 'Question, réponse et catégorie sont requis',
        });
        return;
      }

      const result = await this.faqService.createFaq(faqData);

      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error: any) {
      console.error('Erreur création FAQ:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Récupérer toutes les FAQs
   * GET /api/faqs
   * @param {Request} req - Requête
   * @param {Response} res - Réponse
   * @return {Promise<void>} Résultat
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const query: FaqSearchQuery = {
        category: req.query.category as FaqCategory,
        isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
      };

      const faqs = await this.faqService.getAllFaqs(query);

      res.status(200).json({
        success: true,
        data: faqs,
        count: faqs.length,
      });
    } catch (error: any) {
      console.error('Erreur récupération FAQs:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Récupérer une FAQ par ID
   * GET /api/faqs/:id
   * @param {Request} req - Requête
   * @param {Response} res - Réponse
   * @return {Promise<void>} Résultat
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const faq = await this.faqService.getFaqById(id);

      if (!faq) {
        res.status(404).json({
          success: false,
          message: 'FAQ non trouvée',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: faq,
      });
    } catch (error: any) {
      console.error('Erreur récupération FAQ:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Rechercher des FAQs
   * GET /api/faqs/search?q=texte
   * @param {Request} req - Requête
   * @param {Response} res - Réponse
   * @return {Promise<void>} Résultat
   */
  async search(req: Request, res: Response): Promise<void> {
    try {
      const searchText = req.query.q as string;

      if (!searchText) {
        res.status(400).json({
          success: false,
          message: 'Paramètre de recherche "q" requis',
        });
        return;
      }

      const faqs = await this.faqService.searchFaqs(searchText);

      res.status(200).json({
        success: true,
        data: faqs,
        count: faqs.length,
      });
    } catch (error: any) {
      console.error('Erreur recherche FAQs:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Mettre à jour une FAQ
   * PUT /api/faqs/:id
   * @param {Request} req - Requête
   * @param {Response} res - Réponse
   * @return {Promise<void>} Résultat
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updates: Partial<FAQ> = req.body;

      const result = await this.faqService.updateFaq(id, updates);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error: any) {
      console.error('Erreur mise à jour FAQ:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Supprimer une FAQ
   * DELETE /api/faqs/:id
   * @param {Request} req - Requête
   * @param {Response} res - Réponse
   * @return {Promise<void>} Résultat
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.faqService.deleteFaq(id);

      res.status(200).json(result);
    } catch (error: any) {
      console.error('Erreur suppression FAQ:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Marquer une FAQ comme utile
   * POST /api/faqs/:id/helpful
   * @param {Request} req - Requête
   * @param {Response} res - Réponse
   * @return {Promise<void>} Résultat
   */
  async markHelpful(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { helpful } = req.body;

      if (typeof helpful !== 'boolean') {
        res.status(400).json({
          success: false,
          message: 'Le champ "helpful" (boolean) est requis',
        });
        return;
      }

      const result = await this.faqService.markHelpful(id, helpful);

      res.status(200).json(result);
    } catch (error: any) {
      console.error('Erreur feedback FAQ:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Récupérer les statistiques
   * GET /api/faqs/stats
   * @param {Request} req - Requête
   * @param {Response} res - Réponse
   * @return {Promise<void>} Résultat
   */
  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.faqService.getFaqStats();

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      console.error('Erreur stats FAQ:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Récupérer FAQs par catégorie
   * GET /api/faqs/category/:category
   * @param {Request} req - Requête
   * @param {Response} res - Réponse
   * @return {Promise<void>} Résultat
   */
  async getByCategory(req: Request, res: Response): Promise<void> {
    try {
      const { category } = req.params;
      const faqs = await this.faqService.getFaqsByCategory(category as FaqCategory);

      res.status(200).json({
        success: true,
        data: faqs,
        count: faqs.length,
      });
    } catch (error: any) {
      console.error('Erreur FAQs par catégorie:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Poser une question au chatbot AI
   * POST /api/chat/ask
   * @param {Request} req - Requête
   * @param {Response} res - Réponse
   * @return {Promise<void>} Résultat
   */
  async askQuestion(req: Request, res: Response): Promise<void> {
    try {
      const { userId, question } = req.body;

      if (!userId || !question) {
        res.status(400).json({
          success: false,
          message: 'userId et question sont requis',
        });
        return;
      }

      const result = await this.aiChatService.askQuestion(userId, question);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('Erreur chatbot:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Récupérer l'historique de conversation
   * GET /api/chat/history/:userId
   * @param {Request} req - Requête
   * @param {Response} res - Réponse
   * @return {Promise<void>} Résultat
   */
  async getConversationHistory(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const conversation = await this.aiChatService.getConversationHistory(userId);

      if (!conversation) {
        res.status(404).json({
          success: false,
          message: 'Aucune conversation trouvée',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: conversation,
      });
    } catch (error: any) {
      console.error('Erreur historique conversation:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Récupérer le dernier chat d'un utilisateur
   * GET /api/chat/last/:userId
   * @param {Request} req - Requête
   * @param {Response} res - Réponse
   * @return {Promise<void>} Résultat
   */
  async getLastChat(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const lastMessage = await this.aiChatService.getLastChatMessage(userId);

      if (!lastMessage) {
        res.status(404).json({
          success: false,
          message: 'Aucun message trouvé pour cet utilisateur',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          lastMessage,
          userId,
        },
      });
    } catch (error: any) {
      console.error('Erreur dernier chat:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Marquer un message comme utile
   * POST /api/chat/feedback
   * @param {Request} req - Requête
   * @param {Response} res - Réponse
   * @return {Promise<void>} Résultat
   */
  async markMessageHelpful(req: Request, res: Response): Promise<void> {
    try {
      const { userId, messageIndex, helpful } = req.body;

      if (!userId || messageIndex === undefined || typeof helpful !== 'boolean') {
        res.status(400).json({
          success: false,
          message: 'userId, messageIndex et helpful sont requis',
        });
        return;
      }

      const result = await this.aiChatService.markMessageHelpful(userId, messageIndex, helpful);

      res.status(200).json(result);
    } catch (error: any) {
      console.error('Erreur feedback message:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Supprimer l'historique de conversation
   * DELETE /api/chat/history/:userId
   * @param {Request} req - Requête
   * @param {Response} res - Réponse
   * @return {Promise<void>} Résultat
   */
  async clearConversation(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const result = await this.aiChatService.clearConversation(userId);

      res.status(200).json(result);
    } catch (error: any) {
      console.error('Erreur suppression conversation:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}
