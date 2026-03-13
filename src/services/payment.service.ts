/**
 * Service de gestion des paiements
 */

import { db } from '../config/firebase.config';
import { Payment, PaymentModel, PaymentStatus } from '../models/payment.model';
import { OrangeMoneyService } from './orangemoney.service';

export class PaymentService {
  private collectionName = 'payments';
  private orangeMoneyService: OrangeMoneyService;

  constructor() {
    this.orangeMoneyService = new OrangeMoneyService();
  }

  /**
   * Crée un nouveau paiement
   */
  async create(paymentData: Partial<Payment>): Promise<PaymentModel> {
    try {
      // Validation
      if (!paymentData.userId || !paymentData.enrollmentId || !paymentData.courseId) {
        throw new Error('userId, enrollmentId et courseId sont requis');
      }

      if (!paymentData.amount || paymentData.amount <= 0) {
        throw new Error('Le montant doit être supérieur à 0');
      }

      // Génération de la référence de commande
      const orderReferenceNumber = this.orangeMoneyService.generateOrderReference();

      // Création du modèle de paiement
      const payment = new PaymentModel({
        ...paymentData,
        orderReferenceNumber,
        currency: paymentData.currency || 'XOF',
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Si c'est un paiement Orange Money, initialiser la transaction
      if (payment.paymentMethod === 'orange-money') {
        if (!payment.customerPhoneNumber) {
          throw new Error('Le numéro de téléphone est requis pour Orange Money');
        }

        // Initialisation du paiement Orange Money
        const omResponse = await this.orangeMoneyService.initializePayment({
          amount: payment.amount,
          currency: payment.currency,
          orderReferenceNumber: payment.orderReferenceNumber!,
          customerPhoneNumber: payment.customerPhoneNumber,
          customerFirstName: payment.customerFirstName || 'Client',
          customerLastName: payment.customerLastName || 'MySchool',
          notifUrl: payment.notifUrl || `${process.env.API_BASE_URL}/api/payments/webhook/orange-money`,
          description: payment.description || `Paiement cours MySchool ${payment.courseId}`
        });

        // Mise à jour avec les données Orange Money
        payment.payToken = omResponse.payToken;
        payment.paymentUrl = omResponse.paymentUrl;
        payment.expiresAt = omResponse.expiresAt;
      }

      // Sauvegarde dans Firestore
      const docRef = await db.collection(this.collectionName).add(payment.toJSON());
      payment.id = docRef.id;

      // Mise à jour avec l'ID
      await docRef.update({ id: docRef.id });

      console.log('✅ Paiement créé:', payment.id);
      return payment;
    } catch (error) {
      console.error('❌ Erreur création paiement:', error);
      throw error;
    }
  }

  /**
   * Récupère un paiement par ID
   */
  async getById(id: string): Promise<PaymentModel | null> {
    try {
      const doc = await db.collection(this.collectionName).doc(id).get();
      
      if (!doc.exists) {
        return null;
      }

      return new PaymentModel({ id: doc.id, ...doc.data() });
    } catch (error) {
      console.error('❌ Erreur récupération paiement:', error);
      throw error;
    }
  }

  /**
   * Récupère un paiement par référence de commande
   */
  async getByOrderReference(orderReference: string): Promise<PaymentModel | null> {
    try {
      const snapshot = await db.collection(this.collectionName)
        .where('orderReferenceNumber', '==', orderReference)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return new PaymentModel({ id: doc.id, ...doc.data() });
    } catch (error) {
      console.error('❌ Erreur récupération paiement par référence:', error);
      throw error;
    }
  }

  /**
   * Récupère tous les paiements d'un utilisateur
   */
  async getByUserId(userId: string): Promise<PaymentModel[]> {
    try {
      const snapshot = await db.collection(this.collectionName)
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map(doc => 
        new PaymentModel({ id: doc.id, ...doc.data() })
      );
    } catch (error) {
      console.error('❌ Erreur récupération paiements utilisateur:', error);
      throw error;
    }
  }

  /**
   * Récupère tous les paiements d'une inscription
   */
  async getByEnrollmentId(enrollmentId: string): Promise<PaymentModel[]> {
    try {
      const snapshot = await db.collection(this.collectionName)
        .where('enrollmentId', '==', enrollmentId)
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map(doc => 
        new PaymentModel({ id: doc.id, ...doc.data() })
      );
    } catch (error) {
      console.error('❌ Erreur récupération paiements inscription:', error);
      throw error;
    }
  }

  /**
   * Récupère tous les paiements par statut
   */
  async getByStatus(status: PaymentStatus): Promise<PaymentModel[]> {
    try {
      const snapshot = await db.collection(this.collectionName)
        .where('status', '==', status)
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map(doc => 
        new PaymentModel({ id: doc.id, ...doc.data() })
      );
    } catch (error) {
      console.error('❌ Erreur récupération paiements par statut:', error);
      throw error;
    }
  }

  /**
   * Vérifie le statut d'un paiement Orange Money
   */
  async checkStatus(paymentId: string): Promise<PaymentModel> {
    try {
      const payment = await this.getById(paymentId);
      
      if (!payment) {
        throw new Error('Paiement non trouvé');
      }

      // Si le paiement n'est pas Orange Money ou déjà complété, retourner tel quel
      if (payment.paymentMethod !== 'orange-money' || payment.status !== 'PENDING') {
        return payment;
      }

      // Vérifier avec Orange Money
      const omStatus = await this.orangeMoneyService.checkPaymentStatus(
        payment.payToken!,
        payment.orderReferenceNumber!
      );

      // Mettre à jour le paiement si le statut a changé
      if (omStatus.status !== payment.status) {
        await this.updateStatus(
          paymentId,
          omStatus.status,
          undefined,
          omStatus.transactionId,
          omStatus.operatorTransactionId
        );

        payment.status = omStatus.status;
        payment.transactionId = omStatus.transactionId;
        payment.operatorTransactionId = omStatus.operatorTransactionId;
        
        if (omStatus.status === 'SUCCESS') {
          payment.completedAt = omStatus.completedAt || new Date();
        }
      }

      return payment;
    } catch (error) {
      console.error('❌ Erreur vérification statut paiement:', error);
      throw error;
    }
  }

  /**
   * Met à jour le statut d'un paiement
   */
  async updateStatus(
    paymentId: string,
    status: PaymentStatus,
    metadata?: Record<string, any>,
    transactionId?: string,
    operatorTransactionId?: string
  ): Promise<PaymentModel> {
    try {
      const updateData: any = {
        status,
        updatedAt: new Date()
      };

      if (metadata) {
        Object.assign(updateData, metadata);
      }

      if (transactionId) {
        updateData.transactionId = transactionId;
      }

      if (operatorTransactionId) {
        updateData.operatorTransactionId = operatorTransactionId;
      }

      if (status === 'SUCCESS') {
        updateData.completedAt = new Date();
      }

      await db.collection(this.collectionName)
        .doc(paymentId)
        .update(updateData);

      const updatedPayment = await this.getById(paymentId);
      
      if (!updatedPayment) {
        throw new Error('Paiement non trouvé après mise à jour');
      }

      console.log('✅ Statut paiement mis à jour:', paymentId, status);
      return updatedPayment;
    } catch (error) {
      console.error('❌ Erreur mise à jour statut paiement:', error);
      throw error;
    }
  }

  /**
   * Traite un webhook Orange Money
   */
  async handleWebhook(webhookData: any): Promise<PaymentModel> {
    try {
      // Traiter les données du webhook
      const processedData = this.orangeMoneyService.processWebhook(webhookData);

      // Trouver le paiement correspondant
      const payment = await this.getByOrderReference(processedData.orderReferenceNumber);

      if (!payment) {
        throw new Error(`Paiement non trouvé pour la référence: ${processedData.orderReferenceNumber}`);
      }

      // Mettre à jour le statut
      const updatedPayment = await this.updateStatus(
        payment.id!,
        processedData.status,
        undefined,
        processedData.transactionId
      );

      console.log('✅ Webhook Orange Money traité:', payment.id);
      return updatedPayment;
    } catch (error) {
      console.error('❌ Erreur traitement webhook:', error);
      throw error;
    }
  }

  /**
   * Annule un paiement en attente
   */
  async cancel(paymentId: string): Promise<PaymentModel> {
    try {
      const payment = await this.getById(paymentId);

      if (!payment) {
        throw new Error('Paiement non trouvé');
      }

      if (!payment.canBeCancelled()) {
        throw new Error('Ce paiement ne peut pas être annulé');
      }

      // Si Orange Money, annuler côté opérateur
      if (payment.paymentMethod === 'orange-money' && payment.payToken) {
        await this.orangeMoneyService.cancelPayment(
          payment.payToken,
          payment.orderReferenceNumber!
        );
      }

      // Mettre à jour le statut
      return await this.updateStatus(paymentId, 'CANCELLED');
    } catch (error) {
      console.error('❌ Erreur annulation paiement:', error);
      throw error;
    }
  }

  /**
   * Marque les paiements expirés
   */
  async expireOldPayments(): Promise<number> {
    try {
      const snapshot = await db.collection(this.collectionName)
        .where('status', '==', 'PENDING')
        .get();

      let expiredCount = 0;

      for (const doc of snapshot.docs) {
        const payment = new PaymentModel({ id: doc.id, ...doc.data() });
        
        if (payment.isExpired()) {
          await this.updateStatus(payment.id!, 'EXPIRED');
          expiredCount++;
        }
      }

      console.log(`✅ ${expiredCount} paiements expirés`);
      return expiredCount;
    } catch (error) {
      console.error('❌ Erreur expiration paiements:', error);
      throw error;
    }
  }

  /**
   * Récupère tous les paiements
   */
  async getAll(): Promise<PaymentModel[]> {
    try {
      const snapshot = await db.collection(this.collectionName)
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map(doc => 
        new PaymentModel({ id: doc.id, ...doc.data() })
      );
    } catch (error) {
      console.error('❌ Erreur récupération tous les paiements:', error);
      throw error;
    }
  }

  /**
   * Supprime un paiement
   */
  async delete(id: string): Promise<void> {
    try {
      await db.collection(this.collectionName).doc(id).delete();
      console.log('✅ Paiement supprimé:', id);
    } catch (error) {
      console.error('❌ Erreur suppression paiement:', error);
      throw error;
    }
  }
}
