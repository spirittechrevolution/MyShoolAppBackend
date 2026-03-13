/**
 * Contrôleur pour la gestion des codes promo
 * Gère la création, la mise à jour et la récupération des codes promo
 * avec support pour les commissions influenceur
 */

import { Request, Response } from 'express';
import * as admin from 'firebase-admin';

export interface PromoCode {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  type?: 'fixed' | 'percent';
  value?: number;
  expiresAt: FirebaseFirestore.Timestamp;
  expirationDate?: string;
  maxUsage: number;
  usageLimit?: number;
  usageCount: number;
  isActive: boolean;
  description?: string;
  // Influencer commission tracking
  influenceurId?: string;
  commissionType?: 'percent' | 'fixed';
  commissionValue?: number;
  createdAt?: FirebaseFirestore.Timestamp;
  updatedAt?: FirebaseFirestore.Timestamp;
}

const db = admin.firestore();
const PROMO_CODES_COLLECTION = 'promoCodes';

export class PromoCodeController {
  /**
   * Créer un nouveau code promo
   * POST /api/codes-promo
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const {
        code,
        discountType,
        discountValue,
        type,
        value,
        expiresAt,
        expirationDate,
        maxUsage,
        usageLimit,
        isActive,
        description,
        influenceurId,
        commissionType,
        commissionValue
      } = req.body;

      // Validation
      if (!code) {
        res.status(400).json({
          success: false,
          message: 'Le code promo est requis'
        });
        return;
      }

      const expDate = expirationDate || expiresAt;
      if (!expDate) {
        res.status(400).json({
          success: false,
          message: 'Une date d\'expiration est requise'
        });
        return;
      }

      // Vérifier si le code existe déjà
      const existing = await db.collection(PROMO_CODES_COLLECTION).doc(code).get();
      if (existing.exists) {
        res.status(400).json({
          success: false,
          message: `Le code promo "${code}" existe déjà`
        });
        return;
      }

      // Créer le document promo code
      const promo: PromoCode = {
        code,
        discountType: discountType || type || 'fixed',
        discountValue: discountValue || value || 0,
        type: type || discountType || 'fixed',
        value: value || discountValue || 0,
        expiresAt: admin.firestore.Timestamp.fromDate(new Date(expDate)),
        expirationDate: expDate,
        maxUsage: maxUsage || usageLimit || 1000,
        usageLimit: usageLimit || maxUsage || 1000,
        usageCount: 0,
        isActive: isActive !== undefined ? isActive : true,
        description: description || '',
        influenceurId: influenceurId || '',
        commissionType: commissionType || 'percent',
        commissionValue: commissionValue || 0,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now()
      };

      // Sauvegarder dans Firestore
      await db.collection(PROMO_CODES_COLLECTION).doc(code).set(promo);

      res.status(201).json({
        success: true,
        data: {
          ...promo,
          expiresAt: promo.expiresAt.toDate(),
          createdAt: promo.createdAt?.toDate(),
          updatedAt: promo.updatedAt?.toDate()
        },
        message: `Code promo "${code}" créé avec succès`
      });
    } catch (error: any) {
      console.error('❌ Erreur création code promo:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la création du code promo'
      });
    }
  }

  /**
   * Récupérer tous les codes promo
   * GET /api/codes-promo
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const snapshot = await db.collection(PROMO_CODES_COLLECTION).get();
      const promos = snapshot.docs.map(doc => {
        const data = doc.data() as PromoCode;
        return {
          ...data,
          expiresAt: data.expiresAt?.toDate(),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        };
      });

      res.status(200).json({
        success: true,
        data: promos,
        count: promos.length
      });
    } catch (error: any) {
      console.error('❌ Erreur récupération codes promo:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération des codes promo'
      });
    }
  }

  /**
   * Récupérer un code promo par son code
   * GET /api/codes-promo/:code
   */
  async getByCode(req: Request, res: Response): Promise<void> {
    try {
      const { code } = req.params;

      const doc = await db.collection(PROMO_CODES_COLLECTION).doc(code).get();
      if (!doc.exists) {
        res.status(404).json({
          success: false,
          message: `Code promo "${code}" non trouvé`
        });
        return;
      }

      const data = doc.data() as PromoCode;
      res.status(200).json({
        success: true,
        data: {
          ...data,
          expiresAt: data.expiresAt?.toDate(),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        }
      });
    } catch (error: any) {
      console.error('❌ Erreur récupération code promo:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération du code promo'
      });
    }
  }

  /**
   * Mettre à jour un code promo
   * PUT /api/codes-promo/:code
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { code } = req.params;
      const updates = req.body;

      const doc = await db.collection(PROMO_CODES_COLLECTION).doc(code).get();
      if (!doc.exists) {
        res.status(404).json({
          success: false,
          message: `Code promo "${code}" non trouvé`
        });
        return;
      }

      // Préparer les données à mettre à jour
      const updateData: any = {
        ...updates,
        updatedAt: admin.firestore.Timestamp.now()
      };

      // Convertir les dates si nécessaire
      if (updates.expirationDate) {
        updateData.expiresAt = admin.firestore.Timestamp.fromDate(new Date(updates.expirationDate));
      }
      if (updates.expiresAt) {
        updateData.expiresAt = admin.firestore.Timestamp.fromDate(new Date(updates.expiresAt));
      }

      // Supprimer les champs en double
      delete updateData.createdAt;
      delete updateData.code;

      await db.collection(PROMO_CODES_COLLECTION).doc(code).update(updateData);

      const updated = await db.collection(PROMO_CODES_COLLECTION).doc(code).get();
      const data = updated.data() as PromoCode;

      res.status(200).json({
        success: true,
        data: {
          ...data,
          expiresAt: data.expiresAt?.toDate(),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        },
        message: `Code promo "${code}" mis à jour avec succès`
      });
    } catch (error: any) {
      console.error('❌ Erreur mise à jour code promo:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la mise à jour du code promo'
      });
    }
  }

  /**
   * Supprimer un code promo
   * DELETE /api/codes-promo/:code
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { code } = req.params;

      const doc = await db.collection(PROMO_CODES_COLLECTION).doc(code).get();
      if (!doc.exists) {
        res.status(404).json({
          success: false,
          message: `Code promo "${code}" non trouvé`
        });
        return;
      }

      await db.collection(PROMO_CODES_COLLECTION).doc(code).delete();

      res.status(200).json({
        success: true,
        message: `Code promo "${code}" supprimé avec succès`
      });
    } catch (error: any) {
      console.error('❌ Erreur suppression code promo:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la suppression du code promo'
      });
    }
  }

  /**
   * Valider et appliquer un code promo
   * POST /api/codes-promo/validate/:code
   */
  async validate(req: Request, res: Response): Promise<void> {
    try {
      const { code } = req.params;

      const doc = await db.collection(PROMO_CODES_COLLECTION).doc(code).get();
      if (!doc.exists) {
        res.status(404).json({
          success: false,
          message: `Code promo "${code}" non trouvé`
        });
        return;
      }

      const promo = doc.data() as PromoCode;

      // Vérifier la validité du code
      if (!promo.isActive) {
        res.status(400).json({
          success: false,
          message: `Code promo "${code}" est inactif`
        });
        return;
      }

      if (promo.usageCount >= promo.maxUsage) {
        res.status(400).json({
          success: false,
          message: `Code promo "${code}" a atteint sa limite d'utilisation`
        });
        return;
      }

      if (promo.expiresAt.toDate() < new Date()) {
        res.status(400).json({
          success: false,
          message: `Code promo "${code}" est expiré`
        });
        return;
      }

      // Incrémenter le compteur d'utilisation
      await db.collection(PROMO_CODES_COLLECTION).doc(code).update({
        usageCount: admin.firestore.FieldValue.increment(1)
      });

      res.status(200).json({
        success: true,
        data: {
          code: promo.code,
          discountType: promo.discountType,
          discountValue: promo.discountValue,
          isValid: true,
          influenceurId: promo.influenceurId || null,
          commissionType: promo.commissionType,
          commissionValue: promo.commissionValue
        },
        message: `Code promo "${code}" validé avec succès`
      });
    } catch (error: any) {
      console.error('❌ Erreur validation code promo:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la validation du code promo'
      });
    }
  }

  /**
   * Récupérer les codes promo d'un influenceur
   * GET /api/codes-promo/influencer/:influenceurId
   */
  async getByInfluencer(req: Request, res: Response): Promise<void> {
    try {
      const { influenceurId } = req.params;

      const snapshot = await db
        .collection(PROMO_CODES_COLLECTION)
        .where('influenceurId', '==', influenceurId)
        .get();

      const promos = snapshot.docs.map(doc => {
        const data = doc.data() as PromoCode;
        return {
          ...data,
          expiresAt: data.expiresAt?.toDate(),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        };
      });

      res.status(200).json({
        success: true,
        data: promos,
        count: promos.length
      });
    } catch (error: any) {
      console.error('❌ Erreur récupération codes promo influenceur:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération des codes promo'
      });
    }
  }
}
