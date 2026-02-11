/**
 * Service FAQ pour MySchool
 * Gère les opérations CRUD et recherche des FAQs
 */

import { db } from '../config/firebase.config';
import { FAQ, FaqCategory, FaqSearchQuery, FaqStats } from '../models/faq.model';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

const FAQ_COLLECTION = 'faqs';

export class FaqService {
  /**
   * Créer une nouvelle FAQ
   * @param {FAQ} faqData - Données de la FAQ
   * @return {Promise<{ success: boolean; id?: string; message: string }>} Résultat
   */
  async createFaq(faqData: FAQ): Promise<{ success: boolean; id?: string; message: string }> {
    //MySchool AI
    try {
      const faq: FAQ = {
        ...faqData,
        views: 0,
        helpful: 0,
        notHelpful: 0,
        isActive: faqData.isActive !== false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await db.collection(FAQ_COLLECTION).add(faq);

      return {
        success: true,
        id: docRef.id,
        message: 'FAQ créée avec succès',
      };
    } catch (error: any) {
      console.error('Erreur création FAQ:', error);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Récupérer toutes les FAQs
   * @param {FaqSearchQuery} query - Critères de recherche
   * @return {Promise<FAQ[]>} Liste des FAQs
   */
  async getAllFaqs(query: FaqSearchQuery = {}): Promise<FAQ[]> {
    try {
      console.log('Début getAllFaqs avec query:', query);
      console.log('Collection utilisée:', FAQ_COLLECTION);
      
      let faqQuery = db.collection(FAQ_COLLECTION);

      // Filtrer par catégorie si spécifié
      if (query.category) {
        console.log('Filtrage par catégorie:', query.category);
        faqQuery = faqQuery.where('category', '==', query.category) as any;
      }

      // Filtrer par statut actif si spécifié
      if (query.isActive !== undefined) {
        console.log('Filtrage par isActive:', query.isActive);
        faqQuery = faqQuery.where('isActive', '==', query.isActive) as any;
      }

      // Limite simple sans offset pour éviter les problèmes
      const limit = query.limit || 50;
      faqQuery = faqQuery.limit(limit) as any;

      console.log('Exécution de la requête Firestore...');
      const snapshot = await faqQuery.get();
      console.log('Nombre de documents récupérés:', snapshot.docs.length);

      if (snapshot.docs.length > 0) {
        console.log('Premier document ID:', snapshot.docs[0].id);
        console.log('Premier document data:', snapshot.docs[0].data());
      }

      const faqs = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
        } as FAQ;
      });
      
      console.log('FAQs retournées:', faqs.length);
      return faqs;
    } catch (error: any) {
      console.error('Erreur récupération FAQs:', error);
      console.error('Stack:', error.stack);
      return [];
    }
  }

  /**
   * Récupérer une FAQ par ID
   * @param {string} id - ID de la FAQ
   * @return {Promise<FAQ | null>} FAQ trouvée ou null
   */
  async getFaqById(id: string): Promise<FAQ | null> {
    try {
      const doc = await db.collection(FAQ_COLLECTION).doc(id).get();

      if (!doc.exists) {
        return null;
      }

      // Incrémenter le nombre de vues
      await doc.ref.update({
        views: FieldValue.increment(1),
      });

      return {
        id: doc.id,
        ...doc.data(),
      } as FAQ;
    } catch (error: any) {
      console.error('Erreur récupération FAQ:', error);
      return null;
    }
  }

  /**
   * Rechercher des FAQs par texte (question ou réponse)
   * @param {string} searchText - Texte à rechercher
   * @return {Promise<FAQ[]>} FAQs correspondantes
   */
  async searchFaqs(searchText: string): Promise<FAQ[]> {
    try {
      const snapshot = await db.collection(FAQ_COLLECTION)
        .where('isActive', '==', true)
        .get();

      const searchLower = searchText.toLowerCase();

      // Filtrage côté client (Firestore ne supporte pas la recherche full-text native)
      const results = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as FAQ))
        .filter(faq => {
          const questionMatch = faq.question.toLowerCase().includes(searchLower);
          const answerMatch = faq.answer.toLowerCase().includes(searchLower);
          const tagsMatch = faq.tags.some(tag => tag.toLowerCase().includes(searchLower));
          
          return questionMatch || answerMatch || tagsMatch;
        });

      return results;
    } catch (error: any) {
      console.error('Erreur recherche FAQs:', error);
      return [];
    }
  }

  /**
   * Mettre à jour une FAQ
   * @param {string} id - ID de la FAQ
   * @param {Partial<FAQ>} updates - Données à mettre à jour
   * @return {Promise<{ success: boolean; message: string }>} Résultat
   */
  async updateFaq(id: string, updates: Partial<FAQ>): Promise<{ success: boolean; message: string }> {
    try {
      const faqRef = db.collection(FAQ_COLLECTION).doc(id);
      const doc = await faqRef.get();

      if (!doc.exists) {
        return {
          success: false,
          message: 'FAQ non trouvée',
        };
      }

      await faqRef.update({
        ...updates,
        updatedAt: Timestamp.now(),
      });

      return {
        success: true,
        message: 'FAQ mise à jour avec succès',
      };
    } catch (error: any) {
      console.error('Erreur mise à jour FAQ:', error);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Supprimer une FAQ
   * @param {string} id - ID de la FAQ
   * @return {Promise<{ success: boolean; message: string }>} Résultat
   */
  async deleteFaq(id: string): Promise<{ success: boolean; message: string }> {
    try {
      await db.collection(FAQ_COLLECTION).doc(id).delete();

      return {
        success: true,
        message: 'FAQ supprimée avec succès',
      };
    } catch (error: any) {
      console.error('Erreur suppression FAQ:', error);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Marquer une FAQ comme utile
   * @param {string} id - ID de la FAQ
   * @param {boolean} helpful - true = utile, false = pas utile
   * @return {Promise<{ success: boolean; message: string }>} Résultat
   */
  async markHelpful(id: string, helpful: boolean): Promise<{ success: boolean; message: string }> {
    try {
      const field = helpful ? 'helpful' : 'notHelpful';

      await db.collection(FAQ_COLLECTION).doc(id).update({
        [field]: FieldValue.increment(1),
      });

      return {
        success: true,
        message: 'Feedback enregistré',
      };
    } catch (error: any) {
      console.error('Erreur feedback FAQ:', error);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Récupérer les statistiques des FAQs
   * @return {Promise<FaqStats>} Statistiques
   */
  async getFaqStats(): Promise<FaqStats> {
    try {
      const snapshot = await db.collection(FAQ_COLLECTION).get();

      const faqs = snapshot.docs.map(doc => doc.data() as FAQ);

      const totalViews = faqs.reduce((sum, faq) => sum + (faq.views || 0), 0);
      const totalHelpful = faqs.reduce((sum, faq) => sum + (faq.helpful || 0), 0);
      const totalNotHelpful = faqs.reduce((sum, faq) => sum + (faq.notHelpful || 0), 0);

      const averageHelpfulRate = totalHelpful + totalNotHelpful > 0
        ? (totalHelpful / (totalHelpful + totalNotHelpful)) * 100
        : 0;

      // Top catégories
      const categoryCounts: Record<string, number> = {};
      faqs.forEach(faq => {
        categoryCounts[faq.category] = (categoryCounts[faq.category] || 0) + 1;
      });

      const topCategories = Object.entries(categoryCounts)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Top questions
      const topQuestions = faqs
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 10)
        .map(faq => ({
          question: faq.question,
          views: faq.views || 0,
          id: faq.id || '',
        }));

      return {
        totalFaqs: faqs.length,
        totalViews,
        totalHelpful,
        totalNotHelpful,
        averageHelpfulRate: Math.round(averageHelpfulRate * 100) / 100,
        topCategories,
        topQuestions,
      };
    } catch (error: any) {
      console.error('Erreur stats FAQ:', error);
      return {
        totalFaqs: 0,
        totalViews: 0,
        totalHelpful: 0,
        totalNotHelpful: 0,
        averageHelpfulRate: 0,
        topCategories: [],
        topQuestions: [],
      };
    }
  }

  /**
   * Récupérer les FAQs par catégorie
   * @param {FaqCategory} category - Catégorie
   * @return {Promise<FAQ[]>} FAQs de la catégorie
   */
  async getFaqsByCategory(category: FaqCategory): Promise<FAQ[]> {
    return this.getAllFaqs({ category, isActive: true });
  }
}
