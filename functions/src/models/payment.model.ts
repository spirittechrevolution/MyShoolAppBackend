/**
 * Modèle pour les transactions de paiement Orange Money
 */

export type PaymentStatus = 
  | 'PENDING' 
  | 'SUCCESS' 
  | 'FAILED' 
  | 'CANCELLED' 
  | 'EXPIRED';

export type PaymentMethod = 
  | 'orange-money' 
  | 'wave' 
  | 'free-money' 
  | 'card';

export interface Payment {
  id?: string;
  userId: string;
  enrollmentId: string;
  courseId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  
  // Orange Money specific fields
  orderReferenceNumber?: string; // Référence de la transaction MySchool
  payToken?: string; // Token de paiement Orange Money
  paymentUrl?: string; // URL de paiement pour redirection
  notifUrl?: string; // URL de notification webhook
  
  // Customer info
  customerPhoneNumber?: string;
  customerFirstName?: string;
  customerLastName?: string;
  
  // Transaction details
  transactionId?: string; // ID de transaction Orange Money
  operatorTransactionId?: string; // ID opérateur
  
  // Metadata
  description?: string;
  metadata?: Record<string, any>;
  
  // Timestamps
  createdAt?: Date | any;
  updatedAt?: Date | any;
  completedAt?: Date | any;
  expiresAt?: Date | any;
}

export class PaymentModel implements Payment {
  id?: string;
  userId: string;
  enrollmentId: string;
  courseId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  
  orderReferenceNumber?: string;
  payToken?: string;
  paymentUrl?: string;
  notifUrl?: string;
  
  customerPhoneNumber?: string;
  customerFirstName?: string;
  customerLastName?: string;
  
  transactionId?: string;
  operatorTransactionId?: string;
  
  description?: string;
  metadata?: Record<string, any>;
  
  createdAt?: Date | any;
  updatedAt?: Date | any;
  completedAt?: Date | any;
  expiresAt?: Date | any;

  constructor(data: Partial<Payment>) {
    this.id = data.id;
    this.userId = data.userId || '';
    this.enrollmentId = data.enrollmentId || '';
    this.courseId = data.courseId || '';
    this.amount = data.amount || 0;
    this.currency = data.currency || 'XOF'; // Franc CFA
    this.paymentMethod = data.paymentMethod || 'orange-money';
    this.status = data.status || 'PENDING';
    
    this.orderReferenceNumber = data.orderReferenceNumber;
    this.payToken = data.payToken;
    this.paymentUrl = data.paymentUrl;
    this.notifUrl = data.notifUrl;
    
    this.customerPhoneNumber = data.customerPhoneNumber;
    this.customerFirstName = data.customerFirstName;
    this.customerLastName = data.customerLastName;
    
    this.transactionId = data.transactionId;
    this.operatorTransactionId = data.operatorTransactionId;
    
    this.description = data.description;
    this.metadata = data.metadata || {};
    
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.completedAt = data.completedAt;
    this.expiresAt = data.expiresAt;
  }

  toJSON(): any {
    const json: any = {
      userId: this.userId,
      enrollmentId: this.enrollmentId,
      courseId: this.courseId,
      amount: this.amount,
      currency: this.currency,
      paymentMethod: this.paymentMethod,
      status: this.status,
      orderReferenceNumber: this.orderReferenceNumber,
      payToken: this.payToken,
      paymentUrl: this.paymentUrl,
      notifUrl: this.notifUrl,
      customerPhoneNumber: this.customerPhoneNumber,
      customerFirstName: this.customerFirstName,
      customerLastName: this.customerLastName,
      transactionId: this.transactionId,
      operatorTransactionId: this.operatorTransactionId,
      description: this.description,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      completedAt: this.completedAt,
      expiresAt: this.expiresAt
    };

    if (this.id) {
      json.id = this.id;
    }

    return json;
  }

  /**
   * Vérifie si le paiement est expiré
   * @return {boolean} True si le paiement est expiré
   */
  isExpired(): boolean {
    if (!this.expiresAt) return false;
    const expiryDate = this.expiresAt instanceof Date 
      ? this.expiresAt 
      : new Date(this.expiresAt);
    return new Date() > expiryDate;
  }

  /**
   * Vérifie si le paiement peut être annulé
   * @return {boolean} True si le paiement peut être annulé
   */
  canBeCancelled(): boolean {
    return this.status === 'PENDING';
  }

  /**
   * Vérifie si le paiement est complété
   * @return {boolean} True si le paiement est complété avec succès
   */
  isCompleted(): boolean {
    return this.status === 'SUCCESS';
  }

  /**
   * Vérifie si le paiement a échoué
   * @return {boolean} True si le paiement a échoué, été annulé ou expiré
   */
  isFailed(): boolean {
    return this.status === 'FAILED' || this.status === 'CANCELLED' || this.status === 'EXPIRED';
  }
}
