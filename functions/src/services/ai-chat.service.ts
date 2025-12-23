/**
 * Service AI Chat pour MySchool
 * Utilise Gemini AI pour répondre aux questions des utilisateurs
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '../config/firebase.config';
import { ChatConversation, ChatMessage } from '../models/faq.model';
import { FaqService } from './faq.service';
import { Timestamp } from 'firebase-admin/firestore';

const CHAT_COLLECTION = 'chat_conversations';

export class AiChatService {
  private readonly genAI: GoogleGenerativeAI;
  private readonly faqService: FaqService;

  constructor() {
    // Initialiser Gemini AI
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ GEMINI_API_KEY non configurée. Le chat AI sera désactivé.');
    }
    this.genAI = new GoogleGenerativeAI(apiKey || 'dummy-key');
    this.faqService = new FaqService();
  }

  /**
   * Répondre à une question utilisateur
   * @param userId - ID de l'utilisateur
   * @param question - Question posée
   * @returns Réponse avec la source (FAQ ou IA)
   */
  async askQuestion(userId: string, question: string): Promise<{
    answer: string;
    source: 'faq' | 'ai';
    faqId?: string;
  }> {
    try {
      // 1. Rechercher dans les FAQs existantes
      const faqs = await this.faqService.searchFaqs(question);

      if (faqs.length > 0) {
        // Réponse trouvée dans la FAQ
        const bestMatch = faqs[0]; // Premier résultat = meilleur match

        // Sauvegarder dans l'historique
        await this.saveMessage(userId, question, bestMatch.answer, bestMatch.id);

        return {
          answer: bestMatch.answer,
          source: 'faq',
          faqId: bestMatch.id,
        };
      }

      // 2. Utiliser Gemini AI si pas de FAQ trouvée
      const aiAnswer = await this.generateAiResponse(question);

      // Sauvegarder dans l'historique
      await this.saveMessage(userId, question, aiAnswer);

      return {
        answer: aiAnswer,
        source: 'ai',
      };
    } catch (error: any) {
      console.error('Erreur askQuestion:', error);
      return {
        answer: 'Désolé, je n\'ai pas pu traiter votre question. Veuillez réessayer.',
        source: 'ai',
      };
    }
  }

  /**
   * Générer une réponse avec Gemini AI
   * @param question - Question de l'utilisateur
   * @returns Réponse générée
   */
  private async generateAiResponse(question: string): Promise<string> {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return 'Le service de chat intelligent n\'est pas configuré. Veuillez contacter le support.';
      }

      // Liste des modèles à essayer dans l'ordre (Gemini 2.0 puis 1.5 puis 1.0)
      const modelsToTry = [
        'gemini-2.0-flash-exp',
        'gemini-exp-1206',
        'gemini-2.0-flash-thinking-exp-1219',
        'gemini-1.5-flash-002',
        'gemini-1.5-pro-002',
        'gemini-1.5-flash-8b',
        'gemini-1.5-flash',
        'gemini-1.5-pro',
        'gemini-pro'
      ];

      let lastError: any = null;

      // Essayer chaque modèle jusqu'à ce qu'un fonctionne
      for (const modelName of modelsToTry) {
        try {
          const model = this.genAI.getGenerativeModel({ model: modelName });

          // Contexte pour MySchool
          const context = `Tu es un assistant virtuel pour MySchool, une plateforme d'e-learning.
      
Informations sur MySchool :
- Plateforme de cours en ligne
- Paiements via Orange Money, Wave, Free Money
- Système de parrainage avec deep links
- Certificats de complétion
- Notifications SMS et Push
- Cours de différents niveaux (débutant, intermédiaire, avancé)

Règles de réponse :
1. Sois courtois, professionnel et utile
2. Réponds en français
3. Sois concis (max 3-4 phrases)
4. Si tu ne sais pas, propose de contacter le support
5. Utilise des émojis appropriés (📚 💡 ✅)

Question de l'utilisateur : ${question}`;

          const result = await model.generateContent(context);
          const response = result.response;
          console.log(`✅ Modèle utilisé avec succès: ${modelName}`);
          return response.text();
        } catch (error: any) {
          lastError = error;
          console.log(`⚠️ Modèle ${modelName} non disponible, essai suivant...`);
          continue; // Essayer le modèle suivant
        }
      }

      // Si aucun modèle n'a fonctionné
      console.error('Erreur Gemini AI - Aucun modèle disponible:', lastError);
      return 'Le service de chat intelligent est temporairement indisponible. Veuillez réessayer plus tard ou contacter notre support.';
    } catch (error: any) {
      console.error('Erreur Gemini AI:', error);
      return 'Une erreur est survenue lors du traitement de votre question. Veuillez contacter notre support.';
    }
  }

  /**
   * Sauvegarder un message dans l'historique
   * @param userId - ID utilisateur
   * @param question - Question
   * @param answer - Réponse
   * @param faqId - ID de la FAQ (optionnel)
   */
  private async saveMessage(
    userId: string,
    question: string,
    answer: string,
    faqId?: string
  ): Promise<void> {
    try {
      const userMessage: ChatMessage = {
        role: 'user',
        content: question,
        timestamp: Timestamp.now(),
      };

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: answer,
        timestamp: Timestamp.now(),
        faqId,
      };

      // Récupérer ou créer la conversation
      const conversationRef = db.collection(CHAT_COLLECTION).doc(userId);
      const doc = await conversationRef.get();

      if (doc.exists) {
        // Ajouter aux messages existants
        await conversationRef.update({
          messages: [...(doc.data()?.messages || []), userMessage, assistantMessage],
          updatedAt: Timestamp.now(),
        });
      } else {
        // Créer nouvelle conversation
        const conversation: ChatConversation = {
          userId,
          messages: [userMessage, assistantMessage],
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          resolved: false,
        };

        await conversationRef.set(conversation);
      }
    } catch (error: any) {
      console.error('Erreur sauvegarde message:', error);
    }
  }

  /**
   * Récupérer l'historique de conversation d'un utilisateur
   * @param userId - ID utilisateur
   * @returns Conversation ou null
   */
  async getConversationHistory(userId: string): Promise<ChatConversation | null> {
    try {
      const doc = await db.collection(CHAT_COLLECTION).doc(userId).get();

      if (!doc.exists) {
        return null;
      }

      return {
        id: doc.id,
        ...doc.data(),
      } as ChatConversation;
    } catch (error: any) {
      console.error('Erreur récupération conversation:', error);
      return null;
    }
  }

  /**
   * Récupérer le dernier message de chat d'un utilisateur
   * @param userId - ID utilisateur
   * @returns Dernier message ou null
   */
  async getLastChatMessage(userId: string): Promise<ChatMessage | null> {
    try {
      const doc = await db.collection(CHAT_COLLECTION).doc(userId).get();

      if (!doc.exists) {
        return null;
      }

      const conversation = doc.data() as ChatConversation;
      
      if (!conversation.messages || conversation.messages.length === 0) {
        return null;
      }

      // Récupérer le dernier message (le plus récent)
      const lastMessage = conversation.messages[conversation.messages.length - 1];
      
      return lastMessage;
    } catch (error: any) {
      console.error('Erreur récupération dernier message:', error);
      return null;
    }
  }

  /**
   * Marquer une réponse comme utile/pas utile
   * @param userId - ID utilisateur
   * @param messageIndex - Index du message
   * @param helpful - Utile ou non
   * @returns Résultat de l'opération
   */
  async markMessageHelpful(
    userId: string,
    messageIndex: number,
    helpful: boolean
  ): Promise<{ success: boolean; message: string }> {
    try {
      const conversationRef = db.collection(CHAT_COLLECTION).doc(userId);
      const doc = await conversationRef.get();

      if (!doc.exists) {
        return {
          success: false,
          message: 'Conversation non trouvée',
        };
      }

      const conversation = doc.data() as ChatConversation;
      
      if (messageIndex >= conversation.messages.length) {
        return {
          success: false,
          message: 'Message non trouvé',
        };
      }

      // Mettre à jour le feedback
      conversation.messages[messageIndex].helpful = helpful;

      await conversationRef.update({
        messages: conversation.messages,
      });

      return {
        success: true,
        message: 'Feedback enregistré',
      };
    } catch (error: any) {
      console.error('Erreur feedback message:', error);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Supprimer l'historique de conversation
   * @param userId - ID utilisateur
   * @returns Résultat de l'opération
   */
  async clearConversation(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      await db.collection(CHAT_COLLECTION).doc(userId).delete();

      return {
        success: true,
        message: 'Historique supprimé',
      };
    } catch (error: any) {
      console.error('Erreur suppression conversation:', error);
      return {
        success: false,
        message: error.message,
      };
    }
  }
}
