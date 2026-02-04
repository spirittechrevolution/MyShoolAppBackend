export interface Role {
  libelle: 'student' | 'teacher' | 'admin';
}

export type NiveauScolaire = 'ELEMENTAIRE' | 'MOYEN' | 'SECONDAIRE' | 'UNIVERSITAIRE';

export interface User {
  uid: string;
  email?: string;
  firstName: string;
  lastName: string;
  login?: string;
  password?: string;
  phone: string;
  photoURL?: string;
  profileImageBase64?: string;
  profileImageUpdated?: any;
  level: 'beginner' | 'intermediate' | 'advanced';
  niveauScolaire?: NiveauScolaire;  // Choisi à l'inscription
  role: Role;
  status: 'active' | 'inactive' | 'suspended';
  specializationId?: string;
  
  // Subscription fields
  hasActiveSubscription?: boolean;
  subscriptionId?: string;
  subscriptionPlan?: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
  subscriptionStatus?: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING';
  subscriptionEndDate?: Date | any;
  
  createdAt: Date;
  updatedAt?: Date;
}

export class UserModel implements User {
  uid: string;
  email?: string;
  firstName: string;
  lastName: string;
  login?: string;
  password?: string;
  phone: string;
  photoURL?: string;
  profileImageBase64?: string;
  profileImageUpdated?: any;
  level: 'beginner' | 'intermediate' | 'advanced';
  niveauScolaire?: NiveauScolaire;
  role: Role;
  status: 'active' | 'inactive' | 'suspended';
  specializationId?: string;
  
  // Subscription fields
  hasActiveSubscription?: boolean;
  subscriptionId?: string;
  subscriptionPlan?: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
  subscriptionStatus?: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING';
  subscriptionEndDate?: Date | any;
  
  createdAt: Date;
  updatedAt?: Date;

  constructor(data: Partial<User>) {
    this.uid = data.uid || '';
    this.email = data.email;
    this.firstName = data.firstName || '';
    this.lastName = data.lastName || '';
    this.login = data.login;
    this.password = data.password;
    this.phone = data.phone || '';
    this.photoURL = data.photoURL;
    this.profileImageBase64 = data.profileImageBase64;
    this.profileImageUpdated = data.profileImageUpdated;
    this.level = data.level || 'beginner';
    this.niveauScolaire = data.niveauScolaire;
    this.role = data.role || { libelle: 'student' };
    this.status = data.status || 'active';
    this.specializationId = data.specializationId;
    
    // Subscription fields
    this.hasActiveSubscription = data.hasActiveSubscription || false;
    this.subscriptionId = data.subscriptionId;
    this.subscriptionPlan = data.subscriptionPlan;
    this.subscriptionStatus = data.subscriptionStatus;
    this.subscriptionEndDate = data.subscriptionEndDate;
    
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt;
  }

  toJSON(): any {
    return {
      uid: this.uid,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      login: this.login,
      password: this.password,
      phone: this.phone,
      photoURL: this.photoURL,
      profileImageBase64: this.profileImageBase64,
      profileImageUpdated: this.profileImageUpdated,
      level: this.level,
      niveauScolaire: this.niveauScolaire,
      role: this.role,
      status: this.status,
      specializationId: this.specializationId,
      hasActiveSubscription: this.hasActiveSubscription,
      subscriptionId: this.subscriptionId,
      subscriptionPlan: this.subscriptionPlan,
      subscriptionStatus: this.subscriptionStatus,
      subscriptionEndDate: this.subscriptionEndDate,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
