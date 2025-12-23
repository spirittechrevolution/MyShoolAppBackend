/**
 * Modèle pour les abonnements profil
 */

export type SubscriptionPlan = 
  | 'MONTHLY'     // Mensuel
  | 'QUARTERLY'   // Trimestriel
  | 'ANNUAL';     // Annuel

export type SubscriptionStatus = 
  | 'ACTIVE'      // Actif
  | 'EXPIRED'     // Expiré
  | 'CANCELLED'   // Annulé
  | 'PENDING';    // En attente de paiement

export interface SubscriptionPricing {
  MONTHLY: number;
  QUARTERLY: number;
  ANNUAL: number;
}

// Prix par défaut en XOF
export const DEFAULT_SUBSCRIPTION_PRICING: SubscriptionPricing = {
  MONTHLY: 5000,      // 5 000 FCFA/mois
  QUARTERLY: 12000,   // 12 000 FCFA/3 mois (économie 3000)
  ANNUAL: 40000       // 40 000 FCFA/an (économie 20000)
};

export interface Subscription {
  id?: string;
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  
  // Pricing
  amount: number;
  currency: string;
  
  // Dates
  startDate: Date | any;
  endDate: Date | any;
  nextBillingDate?: Date | any;
  
  // Payment info
  paymentId?: string;
  paymentMethod?: 'wave' | 'orange-money' | 'free-money' | 'card';
  
  // Auto-renewal
  autoRenew: boolean;
  
  // Metadata
  metadata?: Record<string, any>;
  
  // Timestamps
  createdAt: Date | any;
  updatedAt?: Date | any;
  cancelledAt?: Date | any;
}

export class SubscriptionModel implements Subscription {
  id?: string;
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  amount: number;
  currency: string;
  startDate: Date | any;
  endDate: Date | any;
  nextBillingDate?: Date | any;
  paymentId?: string;
  paymentMethod?: 'wave' | 'orange-money' | 'free-money' | 'card';
  autoRenew: boolean;
  metadata?: Record<string, any>;
  createdAt: Date | any;
  updatedAt?: Date | any;
  cancelledAt?: Date | any;

  constructor(data: Partial<Subscription>) {
    this.id = data.id;
    this.userId = data.userId || '';
    this.plan = data.plan || 'MONTHLY';
    this.status = data.status || 'PENDING';
    this.amount = data.amount || DEFAULT_SUBSCRIPTION_PRICING[this.plan];
    this.currency = data.currency || 'XOF';
    this.startDate = data.startDate || new Date();
    this.endDate = data.endDate || this.calculateEndDate(this.plan, this.startDate);
    this.nextBillingDate = data.nextBillingDate;
    this.paymentId = data.paymentId;
    this.paymentMethod = data.paymentMethod;
    this.autoRenew = data.autoRenew !== undefined ? data.autoRenew : true;
    this.metadata = data.metadata;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt;
    this.cancelledAt = data.cancelledAt;
  }

  /**
   * Calcule la date de fin basée sur le plan
   */
  private calculateEndDate(plan: SubscriptionPlan, startDate: Date | any): Date {
    const start = startDate instanceof Date ? startDate : new Date(startDate);
    const endDate = new Date(start);

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
   * Vérifie si l'abonnement est actif
   */
  isActive(): boolean {
    if (this.status !== 'ACTIVE') return false;
    
    const now = new Date();
    const end = this.endDate instanceof Date ? this.endDate : new Date(this.endDate);
    
    return now < end;
  }

  /**
   * Vérifie si l'abonnement est expiré
   */
  isExpired(): boolean {
    if (this.status === 'CANCELLED') return true;
    
    const now = new Date();
    const end = this.endDate instanceof Date ? this.endDate : new Date(this.endDate);
    
    return now >= end;
  }

  /**
   * Calcule les jours restants
   */
  getDaysRemaining(): number {
    const now = new Date();
    const end = this.endDate instanceof Date ? this.endDate : new Date(this.endDate);
    const diff = end.getTime() - now.getTime();
    
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  toJSON(): any {
    const json: any = {
      userId: this.userId,
      plan: this.plan,
      status: this.status,
      amount: this.amount,
      currency: this.currency,
      startDate: this.startDate,
      endDate: this.endDate,
      autoRenew: this.autoRenew,
      createdAt: this.createdAt
    };

    if (this.id) json.id = this.id;
    if (this.nextBillingDate) json.nextBillingDate = this.nextBillingDate;
    if (this.paymentId) json.paymentId = this.paymentId;
    if (this.paymentMethod) json.paymentMethod = this.paymentMethod;
    if (this.metadata) json.metadata = this.metadata;
    if (this.updatedAt) json.updatedAt = this.updatedAt;
    if (this.cancelledAt) json.cancelledAt = this.cancelledAt;

    return json;
  }
}
