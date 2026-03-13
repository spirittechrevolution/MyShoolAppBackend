import * as admin from 'firebase-admin';

// Structure d'un code promo Firestore
export interface PromoCode {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  expiresAt: FirebaseFirestore.Timestamp;
  maxUsage: number;
  usageCount: number;
  isActive: boolean;
}

const PROMO_CODES_COLLECTION = 'promoCodes';

// Fonction utilitaire pour appliquer la réduction
export function applyDiscount(amount: number, promo: PromoCode): number {
  if (promo.discountType === 'percentage') {
    return Math.max(0, Math.round(amount * (1 - promo.discountValue / 100)));
  } else {
    return Math.max(0, amount - promo.discountValue);
  }
}

// Fonction pour récupérer un code promo valide
export async function getValidPromoCode(code: string): Promise<PromoCode | null> {
  const promoSnap = await admin.firestore().collection(PROMO_CODES_COLLECTION).doc(code).get();
  if (!promoSnap.exists) return null;
  const promo = promoSnap.data() as PromoCode;
  if (!promo.isActive || promo.usageCount >= promo.maxUsage || promo.expiresAt.toDate() < new Date()) {
    return null;
  }
  return promo;
}
