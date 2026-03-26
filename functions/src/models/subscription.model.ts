/**
 * Nouveau modèle d'abonnement basé sur le niveau scolaire et les matières
 */

export { NiveauScolaire } from './user.model';
import { NiveauScolaire } from './user.model';

export type SubscriptionStatus = 
  | 'ACTIVE'      // Actif
  | 'EXPIRED'     // Expiré
  | 'CANCELLED'   // Annulé
  | 'PENDING';    // En attente de paiement

export type TypeAbonnement = 
  | 'CLASSE'      // Pour ELEMENTAIRE (abonnement à une classe)
  | 'MATIERE';    // Pour MOYEN/SECONDAIRE/UNIVERSITAIRE (abonnement à 3 matières)

// Prix unique pour tous les niveaux
export const SUBSCRIPTION_PRICE = 5000; // FCFA par an

export interface Subscription {
  id?: string;
  userId: string;
  status: SubscriptionStatus;
  
  // Hiérarchie
  niveauScolaire: NiveauScolaire;    // Hérité du profil utilisateur
  typeAbonnement: TypeAbonnement;    // CLASSE ou MATIERE
  classe: string;                    // OBLIGATOIRE: CM2, Licence2, Terminale S, etc.
  
  // Pour MOYEN/SECONDAIRE/UNIVERSITAIRE uniquement
  matieres?: string[];               // Array de 3 IDs de matières obligatoires
  
  // Pricing
  amount: number;                    // Toujours 5000 FCFA
  currency: string;                  // XOF
  
  // Dates
  startDate: Date | any;
  endDate: Date | any;               // startDate + 1 an
  
  // Payment info
  paymentId?: string;
  paymentMethod?: 'wave' | 'orange-money' | 'free-money' | 'card';
  
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
  status: SubscriptionStatus;
  niveauScolaire: NiveauScolaire;
  typeAbonnement: TypeAbonnement;
  classe: string;
  matieres?: string[];
  amount: number;
  currency: string;
  startDate: Date | any;
  endDate: Date | any;
  paymentId?: string;
  paymentMethod?: 'wave' | 'orange-money' | 'free-money' | 'card';
  metadata?: Record<string, any>;
  createdAt: Date | any;
  updatedAt?: Date | any;
  cancelledAt?: Date | any;

  constructor(data: Partial<Subscription>) {
    this.id = data.id;
    this.userId = data.userId || '';
    this.status = data.status || 'PENDING';
    this.niveauScolaire = data.niveauScolaire || 'MOYEN';
    this.typeAbonnement = data.typeAbonnement || 'MATIERE';
    this.classe = data.classe || '';  // Obligatoire
    this.matieres = data.matieres;
    this.amount = data.amount || SUBSCRIPTION_PRICE;
    this.currency = data.currency || 'XOF';
    
    // ✅ Convertir les Firestore Timestamps en Date
    this.startDate = this.convertTimestamp(data.startDate) || new Date();
    this.endDate = this.convertTimestamp(data.endDate) || this.calculateEndDate(data.startDate);
    
    this.paymentId = data.paymentId;
    this.paymentMethod = data.paymentMethod;
    this.metadata = data.metadata;
    
    this.createdAt = this.convertTimestamp(data.createdAt) || new Date();
    this.updatedAt = this.convertTimestamp(data.updatedAt);
    this.cancelledAt = this.convertTimestamp(data.cancelledAt);
  }

  /**
   * ✅ Convertir les Firestore Timestamps en Date
   * Firestore retourne: { _seconds: 1234567890, _nanoseconds: 123456789 }
   */
  private convertTimestamp(timestamp: any): Date | null {
    if (!timestamp) return null;
    
    // Si c'est déjà une Date, retourner
    if (timestamp instanceof Date) return timestamp;
    
    // Si c'est un Firestore Timestamp avec _seconds
    if (timestamp._seconds !== undefined) {
      return new Date(timestamp._seconds * 1000); // Firestore _seconds est en secondes, Date en millisecondes
    }
    
    // Sinon, essayer de convertir en Date
    try {
      const date = new Date(timestamp);
      return date instanceof Date && !isNaN(date.getTime()) ? date : null;
    } catch (e) {
      return null;
    }
  }

  private calculateEndDate(startDate?: Date | any): Date {
    const start = startDate ? new Date(startDate) : new Date();
    const endDate = new Date(start);
    endDate.setFullYear(endDate.getFullYear() + 1); // +1 an
    return endDate;
  }

  isActive(): boolean {
    if (this.status !== 'ACTIVE') return false;
    
    const now = new Date();
    const end = new Date(this.endDate);
    return now <= end;
  }

  isExpired(): boolean {
    if (this.status === 'CANCELLED') return true;
    
    const now = new Date();
    const end = new Date(this.endDate);
    return now >= end;
  }

  getDaysRemaining(): number {
    const now = new Date();
    const end = new Date(this.endDate);
    const diff = end.getTime() - now.getTime();
    
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  // Validation: Pour MOYEN/SECONDAIRE/UNIVERSITAIRE, doit avoir exactement 3 matières
  validateSubjectSelection(): boolean {
    if (this.typeAbonnement === 'MATIERE') {
      return this.matieres !== undefined && this.matieres.length === 3;
    }
    return true; // CLASSE n'a pas cette contrainte
  }

  toJSON(): any {
    return {
      id: this.id,
      userId: this.userId,
      status: this.status,
      niveauScolaire: this.niveauScolaire,
      typeAbonnement: this.typeAbonnement,
      classe: this.classe,
      matieres: this.matieres,
      amount: this.amount,
      currency: this.currency,
      startDate: this.startDate,
      endDate: this.endDate,
      paymentId: this.paymentId,
      paymentMethod: this.paymentMethod,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      cancelledAt: this.cancelledAt
    };
  }
}
