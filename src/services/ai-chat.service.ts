/**
 * Service AI Chat pour MySchool - Marème
 * Utilise Gemini AI pour répondre aux questions des utilisateurs
 * Marème est l'assistante virtuelle personnalisée de MySchool
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '../config/firebase.config';
import { ChatConversation, ChatMessage } from '../models/faq.model';
import { FaqService } from './faq.service';
import { Timestamp } from 'firebase-admin/firestore';

const CHAT_COLLECTION = 'chat_conversations';

export class AiChatService {
  private genAI: GoogleGenerativeAI;
  private faqService: FaqService;

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
   * @param {string} userId - ID de l'utilisateur
   * @param {string} question - Question posée
   * @return {Promise<{ answer: string; source: 'faq' | 'ai'; faqId?: string }>} Réponse
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

        // Personnaliser la réponse avec Marème
        const personalizedAnswer = `Bonjour ! Je suis Marème 😊\n\n${bestMatch.answer}\n\nN'hésitez pas si vous avez d'autres questions ! 📚`;

        // Sauvegarder dans l'historique
        await this.saveMessage(userId, question, personalizedAnswer, bestMatch.id);

        return {
          answer: personalizedAnswer,
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
   * @param {string} question - Question de l'utilisateur
   * @return {Promise<string>} Réponse générée
   */
  private async generateAiResponse(question: string): Promise<string> {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return 'Le service de chat intelligent n\'est pas configuré. Veuillez contacter le support.';
      }

      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      // Contexte pour MySchool
      const context = `Tu es Marème, l'assistante virtuelle de MySchool, une plateforme d'e-learning sénégalaise.
      
Informations sur MySchool :
- Plateforme de cours en ligne pour tous les niveaux (ELEMENTAIRE, MOYEN, SECONDAIRE, UNIVERSITAIRE)
- Abonnements annuels à 5000 FCFA (CLASSE pour élémentaire, MATIERE pour les autres niveaux)
- Paiements via Orange Money, Wave, Free Money
- Système de parrainage avec deep links
- Certificats de complétion
- Notifications SMS et Push
- Organisation par classes (CM2, 3ème, Terminale S, Licence2, etc.) et matières

Ton rôle en tant que Marème :
1. Sois chaleureuse, professionnelle et serviable
2. Réponds toujours en français
3. Sois concise (max 3-4 phrases)
4. Si tu ne connais pas la réponse, propose de contacter le support
5. Utilise des émojis appropriés (📚 💡 ✅ 🎓)
6. Personnalise tes réponses avec ton prénom "Marème" quand c'est approprié

Question de l'utilisateur : ${question}`;

      const result = await model.generateContent(context);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      console.error('Erreur Gemini AI:', error);
      return 'Une erreur est survenue lors du traitement de votre question. Veuillez contacter notre support.';
    }
  }

  /**
   * Sauvegarder un message dans l'historique
   * @param {string} userId - ID utilisateur
   * @param {string} question - Question
   * @param {string} answer - Réponse
   * @param {string} faqId - ID de la FAQ (optionnel)
   * @return {Promise<void>} Résultat
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
   * @param {string} userId - ID utilisateur
   * @return {Promise<ChatConversation | null>} Conversation
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
   * @param {string} userId - ID utilisateur
   * @return {Promise<ChatMessage | null>} Dernier message
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
   * @param {string} userId - ID utilisateur
   * @param {number} messageIndex - Index du message
   * @param {boolean} helpful - Utile ou non
   * @return {Promise<{ success: boolean; message: string }>} Résultat
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
   * @param {string} userId - ID utilisateur
   * @return {Promise<{ success: boolean; message: string }>} Résultat
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
