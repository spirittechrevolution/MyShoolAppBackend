/**
 * Service de gestion des abonnements - Refactorisé pour le nouveau modèle métier
 */

import { db } from '../config/firebase.config';
import { 
  Subscription, 
  SubscriptionModel,
  NiveauScolaire,
  TypeAbonnement,
  SUBSCRIPTION_PRICE
} from '../models/subscription.model';
import { UserService } from './user.service';
import { MatiereService } from './matiere.service';
import { CourseService } from './course.service';

export class SubscriptionService {
  private collectionName = 'subscriptions';
  private userService: UserService;
  private matiereService: MatiereService;
  private courseService: CourseService;

  constructor() {
    this.userService = new UserService();
    this.matiereService = new MatiereService();
    this.courseService = new CourseService();
  }

  /**
   * Crée un nouvel abonnement
   */
  async create(subscriptionData: Partial<Subscription>): Promise<SubscriptionModel> {
    try {
      if (!subscriptionData.userId || !subscriptionData.niveauScolaire || !subscriptionData.typeAbonnement || !subscriptionData.classe) {
        throw new Error('userId, niveauScolaire, typeAbonnement et classe sont requis');
      }

      // Validation spécifique selon le type d'abonnement
      if (subscriptionData.typeAbonnement === 'CLASSE') {
        // Pour ELEMENTAIRE: pas de sélection de matières, accès à TOUTES les matières de la classe
        if (subscriptionData.niveauScolaire !== 'ELEMENTAIRE') {
          throw new Error('Le type d\'abonnement CLASSE est réservé au niveau ELEMENTAIRE');
        }
      } else if (subscriptionData.typeAbonnement === 'MATIERE') {
        if (!subscriptionData.matieres || subscriptionData.matieres.length !== 3) {
          throw new Error('Exactement 3 matières doivent être sélectionnées pour un abonnement de type MATIERE');
        }
        
        // Valider que les matières appartiennent au bon niveau
        const validMatieres = await this.matiereService.validateMatieresForNiveau(
          subscriptionData.matieres,
          subscriptionData.niveauScolaire
        );
        if (!validMatieres) {
          throw new Error('Les matières sélectionnées ne correspondent pas au niveau scolaire');
        }
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
        amount: SUBSCRIPTION_PRICE,
        currency: 'XOF',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Valider la sélection des matières
      if (!subscription.validateSubjectSelection()) {
        throw new Error('La sélection des matières n\'est pas valide');
      }

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
      const endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + 1); // Toujours 1 an

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
        // subscriptionPlan: 'ANNUAL', // Removed - old model, toujours annuel
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
   * Vérifie si un utilisateur a accès à un cours spécifique
   */
  async hasAccessToCourse(userId: string, courseId: string): Promise<boolean> {
    try {
      // Récupérer le cours
      const course = await this.courseService.getById(courseId);
      if (!course) {
        return false;
      }

      // Récupérer l'abonnement actif de l'utilisateur
      const subscription = await this.getActiveSubscription(userId);
      if (!subscription || !subscription.isActive()) {
        return false;
      }

      // Vérifier la correspondance selon le type d'abonnement
      if (subscription.typeAbonnement === 'CLASSE') {
        // Pour ELEMENTAIRE: vérifier que le cours est dans la même classe
        return course.niveauScolaire === subscription.niveauScolaire && 
               course.classe === subscription.classe;
      } else {
        // Pour MATIERE: vérifier que le cours fait partie des 3 matières sélectionnées
        return course.niveauScolaire === subscription.niveauScolaire &&
               subscription.matieres?.includes(course.matiereId || '') === true;
      }
    } catch (error) {
      console.error('❌ Erreur vérification accès cours:', error);
      return false;
    }
  }

  /**
   * Vérifie si un utilisateur a accès illimité (au moins un abonnement actif)
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
   * Récupère les matières disponibles pour un niveau scolaire
   */
  async getAvailableSubjects(niveauScolaire: NiveauScolaire): Promise<any[]> {
    try {
      return await this.matiereService.getByNiveau(niveauScolaire);
    } catch (error) {
      console.error('❌ Erreur récupération matières disponibles:', error);
      throw error;
    }
  }

  /**
   * Valide la sélection des matières pour un abonnement
   */
  async validateSubjectSelection(niveauScolaire: NiveauScolaire, matiereIds: string[]): Promise<boolean> {
    try {
      // Pour ELEMENTAIRE, pas besoin de validation (pas de sélection de matières)
      if (niveauScolaire === 'ELEMENTAIRE') {
        return true;
      }

      // Pour les autres niveaux, vérifier que 3 matières sont sélectionnées
      if (matiereIds.length !== 3) {
        return false;
      }

      // Vérifier que les matières appartiennent au bon niveau
      return await this.matiereService.validateMatieresForNiveau(matiereIds, niveauScolaire);
    } catch (error) {
      console.error('❌ Erreur validation sélection matières:', error);
      return false;
    }
  }

  /**
   * Récupère les informations de prix d'abonnement
   */
  getSubscriptionPrice(): { amount: number; currency: string; duration: string } {
    return {
      amount: SUBSCRIPTION_PRICE,
      currency: 'XOF',
      duration: '1 an'
    };
  }
}

export const subscriptionService = new SubscriptionService();
