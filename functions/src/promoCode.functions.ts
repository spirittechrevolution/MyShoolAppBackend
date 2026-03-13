import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

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

// Fonction pour créer un code promo
export const createPromoCode = functions.https.onCall(async (data: any, context: any) => {
  // Vérification des droits d'admin à ajouter ici si besoin
  const promo: PromoCode = {
    code: data.code,
    discountType: data.discountType,
    discountValue: data.discountValue,
    expiresAt: admin.firestore.Timestamp.fromDate(new Date(data.expiresAt)),
    maxUsage: data.maxUsage,
    usageCount: 0,
    isActive: true,
  };
  await admin.firestore().collection(PROMO_CODES_COLLECTION).doc(promo.code).set(promo);
  return { success: true, promo };
});

// Fonction pour valider et appliquer un code promo
export const applyPromoCode = functions.https.onCall(async (data: any, context: any) => {
  const code = data.code;
  const promoSnap = await admin.firestore().collection(PROMO_CODES_COLLECTION).doc(code).get();
  if (!promoSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Code promo invalide');
  }
  const promo = promoSnap.data() as PromoCode;
  if (!promo.isActive || promo.usageCount >= promo.maxUsage || promo.expiresAt.toDate() < new Date()) {
    throw new functions.https.HttpsError('failed-precondition', 'Code promo expiré ou non valide');
  }
  // Incrémenter usageCount
  await promoSnap.ref.update({ usageCount: admin.firestore.FieldValue.increment(1) });
  return { success: true, promo };
});
