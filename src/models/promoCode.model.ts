// Modèle de code promo pour Firestore
export interface PromoCode {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  expiresAt: Date;
  maxUsage: number;
  usageCount: number;
  isActive: boolean;
}

export class PromoCodeModel implements PromoCode {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  expiresAt: Date;
  maxUsage: number;
  usageCount: number;
  isActive: boolean;

  constructor(data: Partial<PromoCode>) {
    this.code = data.code || '';
    this.discountType = data.discountType || 'percentage';
    this.discountValue = data.discountValue || 0;
    this.expiresAt = data.expiresAt || new Date();
    this.maxUsage = data.maxUsage || 1;
    this.usageCount = data.usageCount || 0;
    this.isActive = data.isActive !== false;
  }

  toJSON(): any {
    return {
      code: this.code,
      discountType: this.discountType,
      discountValue: this.discountValue,
      expiresAt: this.expiresAt,
      maxUsage: this.maxUsage,
      usageCount: this.usageCount,
      isActive: this.isActive
    };
  }
}

// Exporter le modèle par défaut
export const promoCodeSchema = null; // Non utilisé avec Firestore
export default PromoCodeModel;
