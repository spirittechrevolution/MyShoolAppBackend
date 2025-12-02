/**
 * Modèle FAQ pour MySchool
 * Gère les questions fréquemment posées avec catégorisation et recherche
 */

import { Timestamp } from 'firebase-admin/firestore';

/**
 * Interface pour une question FAQ
 */
export interface FAQ {
  id?: string;
  category: FaqCategory;
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
  tags: string[];
  views: number;
  helpful: number;
  notHelpful: number;
  relatedQuestions?: string[]; // IDs d'autres FAQs liées
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  createdBy?: string; // Admin qui a créé
}

/**
 * Catégories de FAQ
 */
export enum FaqCategory {
  GENERAL = 'general',
  PAYMENTS = 'payments',
  COURSES = 'courses',
  ENROLLMENT = 'enrollment',
  CERTIFICATES = 'certificates',
  TECHNICAL = 'technical',
  ACCOUNT = 'account',
  REFERRAL = 'referral',
}

/**
 * Interface pour une conversation de chat
 */
export interface ChatConversation {
  id?: string;
  userId: string;
  messages: ChatMessage[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  resolved: boolean;
  rating?: number; // 1-5
}

/**
 * Interface pour un message de chat
 */
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Timestamp;
  faqId?: string; // Si la réponse vient d'une FAQ existante
  helpful?: boolean; // Feedback utilisateur
}

/**
 * Interface pour les statistiques FAQ
 */
export interface FaqStats {
  totalFaqs: number;
  totalViews: number;
  totalHelpful: number;
  totalNotHelpful: number;
  averageHelpfulRate: number;
  topCategories: Array<{ category: string; count: number }>;
  topQuestions: Array<{ question: string; views: number; id: string }>;
}

/**
 * Interface pour une requête de recherche FAQ
 */
export interface FaqSearchQuery {
  query?: string;
  category?: FaqCategory;
  tags?: string[];
  isActive?: boolean;
  limit?: number;
  offset?: number;
}
