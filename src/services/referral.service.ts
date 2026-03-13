/**
 * Service de gestion des parrainages
 */

import { db } from '../config/firebase.config';
import { 
  Referral, 
 
  ReferralStats, 
  ReferralModel,
  BonusType 
} from '../models/referral.model';
import { FieldValue } from 'firebase-admin/firestore';

export class ReferralService {
  private collectionName = 'referrals';

  /**
   * Génère un lien de parrainage pour un utilisateur
   * @param referrerId - ID de l'utilisateur qui parraine
   * @param bonusAmount - Montant du bonus en centimes (ex: 500 = 5 FCFA)
   * @param bonusType - Type de bonus
   * @return Referral créé avec deep link
   */
  async generateReferralLink(
    referrerId: string,
    bonusAmount: number = 500,
    bonusType: BonusType = 'DISCOUNT'
  ): Promise<Referral> {
    // Vérifier si l'utilisateur a déjà un code actif
    const existingRef = await this.getActiveReferralByUser(referrerId);
    if (existingRef) {
      return existingRef;
    }

    // Générer un code unique
    const referralCode = ReferralModel.generateReferralCode(referrerId);

    // Vérifier l'unicité du code
    const codeExists = await this.getReferralByCode(referralCode);
    if (codeExists) {
      // Régénérer si collision (très rare)
      return this.generateReferralLink(referrerId, bonusAmount, bonusType);
    }

    const deepLink = ReferralModel.generateDeepLink(referralCode);
    const webLink = ReferralModel.generateWebLink(referralCode);
    const shareText = ReferralModel.generateShareText(referralCode, bonusAmount);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // Expire dans 30 jours

    const referral: Referral = {
      referrerId,
      referralCode,
      status: 'PENDING',
      bonusAmount,
      bonusType,
      clicks: 0,
      conversions: 0,
      createdAt: FieldValue.serverTimestamp(),
      expiresAt,
      metadata: {
        deepLink,
        webLink,
        shareText
      }
    };

    const docRef = await db.collection(this.collectionName).add(referral);
    referral.id = docRef.id;

    return referral;
  }

  /**
   * Récupère un parrainage par son code
   * @param code - Code de parrainage
   * @return Referral ou null
   */
  async getReferralByCode(code: string): Promise<Referral | null> {
    const snapshot = await db
      .collection(this.collectionName)
      .where('referralCode', '==', code)
      .limit(1)
      .get();

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Referral;
  }

  /**
   * Récupère le parrainage actif d'un utilisateur
   * @param referrerId - ID de l'utilisateur
   * @return Referral ou null
   */
  async getActiveReferralByUser(referrerId: string): Promise<Referral | null> {
    const snapshot = await db
      .collection(this.collectionName)
      .where('referrerId', '==', referrerId)
      .where('status', '==', 'PENDING')
      .limit(1)
      .get();

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    const referral = { id: doc.id, ...doc.data() } as Referral;

    // Vérifier si expiré
    if (ReferralModel.isExpired(referral)) {
      await this.expireReferral(referral.id!);
      return null;
    }

    return referral;
  }

  /**
   * Enregistre un clic sur un lien de parrainage
   * @param code - Code de parrainage
   * @param source - Source du clic (whatsapp, sms, etc.)
   * @return Referral mis à jour
   */
  async trackClick(code: string, source?: string): Promise<Referral | null> {
    const referral = await this.getReferralByCode(code);
    if (!referral || !referral.id) return null;

    // Vérifier si expiré
    if (ReferralModel.isExpired(referral)) {
      await this.expireReferral(referral.id);
      return null;
    }

    await db.collection(this.collectionName).doc(referral.id).update({
      clicks: FieldValue.increment(1),
      'metadata.source': source || 'unknown'
    });

    referral.clicks += 1;
    return referral;
  }

  /**
   * Valide un code de parrainage lors de l'inscription
   * @param code - Code de parrainage
   * @param newUserId - ID du nouvel utilisateur
   * @return Referral complété ou null si invalide
   */
  async validateAndComplete(code: string, newUserId: string): Promise<Referral | null> {
    const referral = await this.getReferralByCode(code);
    
    if (!referral || !referral.id) {
      throw new Error('Code de parrainage invalide');
    }

    // Vérifier si le parrainage peut être complété
    if (!ReferralModel.canBeCompleted(referral)) {
      throw new Error('Ce code de parrainage a expiré ou a déjà été utilisé');
    }

    // Vérifier que l'utilisateur ne se parraine pas lui-même
    if (referral.referrerId === newUserId) {
      throw new Error('Vous ne pouvez pas utiliser votre propre code de parrainage');
    }

    // Marquer comme complété
    await db.collection(this.collectionName).doc(referral.id).update({
      referredUserId: newUserId,
      status: 'COMPLETED',
      completedAt: FieldValue.serverTimestamp(),
      conversions: FieldValue.increment(1)
    });

    // Mettre à jour les statistiques de l'utilisateur parrain
    await this.updateUserStats(referral.referrerId, referral.bonusAmount);

    // Mettre à jour le nouvel utilisateur avec le code parrain
    await db.collection('users').doc(newUserId).update({
      referredBy: code,
      referralBonus: referral.bonusAmount // Bonus de bienvenue
    });

    referral.referredUserId = newUserId;
    referral.status = 'COMPLETED';
    referral.conversions += 1;

    return referral;
  }

  /**
   * Met à jour les statistiques de parrainage d'un utilisateur
   * @param userId - ID de l'utilisateur
   * @param bonusAmount - Montant à ajouter
   */
  private async updateUserStats(userId: string, bonusAmount: number): Promise<void> {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      await userRef.update({
        referralEarnings: FieldValue.increment(bonusAmount),
        referralCount: FieldValue.increment(1)
      });
    }
  }

  /**
   * Récupère toutes les statistiques de parrainage d'un utilisateur
   * @param userId - ID de l'utilisateur
   * @return ReferralStats
   */
  async getUserReferralStats(userId: string): Promise<ReferralStats> {
    // Récupérer tous les parrainages de l'utilisateur
    const snapshot = await db
      .collection(this.collectionName)
      .where('referrerId', '==', userId)
      .get();

    const referrals = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Referral[];

    // Calculer les statistiques
    let totalClicks = 0;
    let totalConversions = 0;
    let activeReferrals = 0;
    let completedReferrals = 0;
    let expiredReferrals = 0;
    let cancelledReferrals = 0;
    let totalEarnings = 0;
    let pendingBonus = 0;

    referrals.forEach(ref => {
      totalClicks += ref.clicks || 0;
      totalConversions += ref.conversions || 0;

      if (ref.status === 'PENDING') {
        activeReferrals++;
        pendingBonus += ref.bonusAmount;
      } else if (ref.status === 'COMPLETED') {
        completedReferrals++;
        totalEarnings += ref.bonusAmount;
      } else if (ref.status === 'EXPIRED') {
        expiredReferrals++;
      } else if (ref.status === 'CANCELLED') {
        cancelledReferrals++;
      }
    });

    const conversionRate = ReferralModel.calculateConversionRate(totalClicks, totalConversions);

    return {
      totalReferrals: referrals.length,
      activeReferrals,
      completedReferrals,
      expiredReferrals,
      cancelledReferrals,
      totalClicks,
      totalConversions,
      conversionRate,
      totalEarnings,
      pendingBonus,
      referrals
    };
  }

  /**
   * Récupère tous les parrainages d'un utilisateur
   * @param userId - ID de l'utilisateur
   * @return Liste des parrainages
   */
  async getUserReferrals(userId: string): Promise<Referral[]> {
    const snapshot = await db
      .collection(this.collectionName)
      .where('referrerId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Referral[];
  }

  /**
   * Récupère un parrainage par ID
   * @param id - ID du parrainage
   * @return Referral ou null
   */
  async getById(id: string): Promise<Referral | null> {
    const doc = await db.collection(this.collectionName).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as Referral;
  }

  /**
   * Marque un parrainage comme expiré
   * @param id - ID du parrainage
   */
  async expireReferral(id: string): Promise<void> {
    await db.collection(this.collectionName).doc(id).update({
      status: 'EXPIRED'
    });
  }

  /**
   * Annule un parrainage
   * @param id - ID du parrainage
   */
  async cancelReferral(id: string): Promise<void> {
    await db.collection(this.collectionName).doc(id).update({
      status: 'CANCELLED'
    });
  }

  /**
   * Récupère tous les parrainages (admin)
   * @return Liste de tous les parrainages
   */
  async getAll(): Promise<Referral[]> {
    const snapshot = await db
      .collection(this.collectionName)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Referral[];
  }

  /**
   * Supprime un parrainage
   * @param id - ID du parrainage
   */
  async delete(id: string): Promise<void> {
    await db.collection(this.collectionName).doc(id).delete();
  }
}
