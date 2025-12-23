/**
 * Service de gestion des abonnements
 */

import { db } from '../config/firebase.config';
import { 
  Subscription, 
  SubscriptionModel, 
  SubscriptionPlan, 
  DEFAULT_SUBSCRIPTION_PRICING 
} from '../models/subscription.model';
import { UserService } from './user.service';

export class SubscriptionService {
  private collectionName = 'subscriptions';
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  /**
   * Crée un nouvel abonnement
   */
  async create(subscriptionData: Partial<Subscription>): Promise<SubscriptionModel> {
    try {
      if (!subscriptionData.userId || !subscriptionData.plan) {
        throw new Error('userId et plan sont requis');
      }

      // Vérifier si l'utilisateur a déjà un abonnement actif
      const existingSubscription = await this.getActiveSubscription(subscriptionData.userId);
      if (existingSubscription) {
        throw new Error('L\'utilisateur a déjà un abonnement actif');
      }

      // Créer le modèle d'abonnement
      const subscription = new SubscriptionModel({
        ...subscriptionData,
        status: subscriptionData.status || 'PENDING',
        amount: subscriptionData.amount || DEFAULT_SUBSCRIPTION_PRICING[subscriptionData.plan!],
        currency: subscriptionData.currency || 'XOF',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Sauvegarder dans Firestore
      const docRef = await db.collection(this.collectionName).add(subscription.toJSON());
      subscription.id = docRef.id;

      // Mise à jour avec l'ID
      await docRef.update({ id: docRef.id });

      console.log('✅ Abonnement créé:', subscription.id);
      return subscription;
    } catch (error) {
      console.error('❌ Erreur création abonnement:', error);
      throw error;
    }
  }

  /**
   * Récupère un abonnement par ID
   */
  async getById(id: string): Promise<SubscriptionModel | null> {
    try {
      const doc = await db.collection(this.collectionName).doc(id).get();
      
      if (!doc.exists) {
        return null;
      }

      return new SubscriptionModel({ id: doc.id, ...doc.data() });
    } catch (error) {
      console.error('❌ Erreur récupération abonnement:', error);
      throw error;
    }
  }

  /**
   * Récupère l'abonnement actif d'un utilisateur
   */
  async getActiveSubscription(userId: string): Promise<SubscriptionModel | null> {
    try {
      const snapshot = await db.collection(this.collectionName)
        .where('userId', '==', userId)
        .where('status', '==', 'ACTIVE')
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      const subscription = new SubscriptionModel({ id: doc.id, ...doc.data() });

      // Vérifier si l'abonnement n'est pas expiré
      if (subscription.isExpired()) {
        await this.expireSubscription(subscription.id!);
        return null;
      }

      return subscription;
    } catch (error) {
      console.error('❌ Erreur récupération abonnement actif:', error);
      throw error;
    }
  }

  /**
   * Récupère tous les abonnements d'un utilisateur
   */
  async getUserSubscriptions(userId: string): Promise<SubscriptionModel[]> {
    try {
      const snapshot = await db.collection(this.collectionName)
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map(doc => 
        new SubscriptionModel({ id: doc.id, ...doc.data() })
      );
    } catch (error) {
      console.error('❌ Erreur récupération abonnements utilisateur:', error);
      throw error;
    }
  }

  /**
   * Active un abonnement après paiement
   */
  async activateSubscription(subscriptionId: string, paymentId: string, paymentMethod: string): Promise<SubscriptionModel> {
    try {
      const subscription = await this.getById(subscriptionId);
      if (!subscription) {
        throw new Error('Abonnement non trouvé');
      }

      const now = new Date();
      const startDate = now;
      const endDate = this.calculateEndDate(subscription.plan, startDate);

      // Mettre à jour l'abonnement
      await db.collection(this.collectionName).doc(subscriptionId).update({
        status: 'ACTIVE',
        startDate: startDate,
        endDate: endDate,
        paymentId: paymentId,
        paymentMethod: paymentMethod,
        updatedAt: new Date()
      });

      // Mettre à jour l'utilisateur
      await this.userService.update(subscription.userId, {
        hasActiveSubscription: true,
        subscriptionId: subscriptionId,
        subscriptionPlan: subscription.plan,
        subscriptionStatus: 'ACTIVE',
        subscriptionEndDate: endDate
      });

      console.log(`✅ Abonnement activé: ${subscriptionId} pour user: ${subscription.userId}`);
      
      // Récupérer l'abonnement mis à jour
      return (await this.getById(subscriptionId))!;
    } catch (error) {
      console.error('❌ Erreur activation abonnement:', error);
      throw error;
    }
  }

  /**
   * Expire un abonnement
   */
  async expireSubscription(subscriptionId: string): Promise<void> {
    try {
      const subscription = await this.getById(subscriptionId);
      if (!subscription) {
        throw new Error('Abonnement non trouvé');
      }

      await db.collection(this.collectionName).doc(subscriptionId).update({
        status: 'EXPIRED',
        updatedAt: new Date()
      });

      // Mettre à jour l'utilisateur
      await this.userService.update(subscription.userId, {
        hasActiveSubscription: false,
        subscriptionStatus: 'EXPIRED'
      });

      console.log(`⏰ Abonnement expiré: ${subscriptionId}`);
    } catch (error) {
      console.error('❌ Erreur expiration abonnement:', error);
      throw error;
    }
  }

  /**
   * Annule un abonnement
   */
  async cancelSubscription(subscriptionId: string): Promise<void> {
    try {
      const subscription = await this.getById(subscriptionId);
      if (!subscription) {
        throw new Error('Abonnement non trouvé');
      }

      await db.collection(this.collectionName).doc(subscriptionId).update({
        status: 'CANCELLED',
        autoRenew: false,
        cancelledAt: new Date(),
        updatedAt: new Date()
      });

      // Mettre à jour l'utilisateur
      await this.userService.update(subscription.userId, {
        hasActiveSubscription: false,
        subscriptionStatus: 'CANCELLED'
      });

      console.log(`🚫 Abonnement annulé: ${subscriptionId}`);
    } catch (error) {
      console.error('❌ Erreur annulation abonnement:', error);
      throw error;
    }
  }

  /**
   * Vérifie et expire les abonnements expirés
   */
  async checkAndExpireSubscriptions(): Promise<number> {
    try {
      const snapshot = await db.collection(this.collectionName)
        .where('status', '==', 'ACTIVE')
        .get();

      let expiredCount = 0;

      for (const doc of snapshot.docs) {
        const subscription = new SubscriptionModel({ id: doc.id, ...doc.data() });
        
        if (subscription.isExpired()) {
          await this.expireSubscription(subscription.id!);
          expiredCount++;
        }
      }

      console.log(`🔄 Vérification abonnements: ${expiredCount} expirés`);
      return expiredCount;
    } catch (error) {
      console.error('❌ Erreur vérification abonnements:', error);
      throw error;
    }
  }

  /**
   * Vérifie si un utilisateur a accès à tous les cours
   */
  async hasUnlimitedAccess(userId: string): Promise<boolean> {
    try {
      const subscription = await this.getActiveSubscription(userId);
      return subscription !== null && subscription.isActive();
    } catch (error) {
      console.error('❌ Erreur vérification accès illimité:', error);
      return false;
    }
  }

  /**
   * Calcule la date de fin basée sur le plan
   */
  private calculateEndDate(plan: SubscriptionPlan, startDate: Date): Date {
    const endDate = new Date(startDate);

    switch (plan) {
      case 'MONTHLY':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case 'QUARTERLY':
        endDate.setMonth(endDate.getMonth() + 3);
        break;
      case 'ANNUAL':
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
    }

    return endDate;
  }

  /**
   * Récupère le prix d'un plan
   */
  getPlanPrice(plan: SubscriptionPlan): number {
    return DEFAULT_SUBSCRIPTION_PRICING[plan];
  }

  /**
   * Récupère tous les plans disponibles avec leurs prix
   */
  getAvailablePlans(): { plan: SubscriptionPlan; price: number; duration: string }[] {
    return [
      { plan: 'MONTHLY', price: DEFAULT_SUBSCRIPTION_PRICING.MONTHLY, duration: '1 mois' },
      { plan: 'QUARTERLY', price: DEFAULT_SUBSCRIPTION_PRICING.QUARTERLY, duration: '3 mois' },
      { plan: 'ANNUAL', price: DEFAULT_SUBSCRIPTION_PRICING.ANNUAL, duration: '12 mois' }
    ];
  }
}

export const subscriptionService = new SubscriptionService();
