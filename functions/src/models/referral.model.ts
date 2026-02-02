/**
 * Modèle de Parrainage (Referral)
 * 
 * Gère le système de parrainage avec deep links
 */

export type ReferralStatus = 'PENDING' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED';
export type BonusType = 'DISCOUNT' | 'FREE_COURSE' | 'POINTS';

export interface Referral {
  id?: string;
  referrerId: string;           // ID de l'utilisateur qui parraine
  referredUserId?: string;      // ID de l'utilisateur parrainé (null si pas encore inscrit)
  referralCode: string;         // Code unique (ex: REF_GPL8_A1B2C3)
  status: ReferralStatus;
  bonusAmount: number;          // Montant du bonus en centimes XOF (ex: 500 = 5 FCFA)
  bonusType: BonusType;
  clicks: number;               // Nombre de clics sur le lien
  conversions: number;          // Nombre d'inscriptions complétées
  createdAt?: any;
  completedAt?: any;
  expiresAt?: any;              // Date d'expiration (30 jours par défaut)
  metadata?: {
    deepLink?: string;          // myschool://referral?code=XXX
    webLink?: string;           // https://myschool-app.com/join?ref=XXX
    shareText?: string;
    source?: string;            // whatsapp, sms, email, etc.
  };
}

export interface ReferralStats {
  totalReferrals: number;       // Total de parrainages
  activeReferrals: number;      // Parrainages PENDING
  completedReferrals: number;   // Parrainages COMPLETED
  expiredReferrals: number;     // Parrainages EXPIRED
  cancelledReferrals: number;   // Parrainages CANCELLED
  totalClicks: number;          // Total de clics
  totalConversions: number;     // Total de conversions
  conversionRate: number;       // Taux de conversion (%)
  totalEarnings: number;        // Total des gains en centimes
  pendingBonus: number;         // Bonus en attente en centimes
  referrals: Referral[];        // Liste des parrainages
}

export interface ReferralReward {
  referrerReward: {
    type: BonusType;
    amount: number;
    description: string;
  };
  referredReward: {
    type: BonusType;
    amount: number;
    description: string;
  };
}

/**
 * Classe utilitaire pour le modèle Referral
 */
export class ReferralModel {
  /**
   * Vérifie si un parrainage a expiré
   */
  static isExpired(referral: Referral): boolean {
    if (!referral.expiresAt) return false;
    const expiryDate = new Date(referral.expiresAt._seconds * 1000);
    return new Date() > expiryDate;
  }

  /**
   * Vérifie si un parrainage peut être complété
   */
  static canBeCompleted(referral: Referral): boolean {
    return referral.status === 'PENDING' && !this.isExpired(referral);
  }

  /**
   * Génère un code de parrainage unique
   */
  static generateReferralCode(userId: string): string {
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    const userPart = userId.substring(0, 4).toUpperCase();
    return `REF_${userPart}_${randomPart}`;
  }

  /**
   * Génère un deep link
   */
  static generateDeepLink(code: string): string {
    return `myschool://referral?code=${code}`;
  }

  /**
   * Génère un web link
   */
  static generateWebLink(code: string): string {
    return `https://beta.myschool.sn/join?ref=${code}`;
  }

  /**
   * Génère le texte de partage
   */
  static generateShareText(code: string, bonusAmount: number): string {
    const bonusInFCFA = (bonusAmount / 100).toFixed(2);
    return `🎓 Rejoins MySchool avec mon lien !\n\nTu reçois: ${bonusInFCFA} FCFA de réduction\nJe reçois: ${bonusInFCFA} FCFA de réduction\n\n👉 myschool://referral?code=${code}\n\nApprends avec les meilleurs cours !`;
  }

  /**
   * Calcule le taux de conversion
   */
  static calculateConversionRate(clicks: number, conversions: number): number {
    if (clicks === 0) return 0;
    return Math.round((conversions / clicks) * 100 * 100) / 100;
  }
}
