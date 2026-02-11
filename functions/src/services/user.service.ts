import { db, auth } from '../config/firebase.config';
import { UserModel, User } from '../models';

export class UserService {
  private collectionName = 'utilisateur';

  async create(userData: Partial<User>): Promise<UserModel> {
    try {
      // Créer l'utilisateur dans Firebase Auth si email/login et password fournis
      let uid: string;
      
      if (userData.email && userData.password) {
        // Créer avec Firebase Authentication
        const authData: any = {
          email: userData.email,
          password: userData.password,
          displayName: `${userData.firstName} ${userData.lastName}`
        };
        
        // Ajouter le téléphone uniquement s'il est au format valide
        if (userData.phone && userData.phone.startsWith('+')) {
          authData.phoneNumber = userData.phone;
        }
        
        const userRecord = await auth.createUser(authData);
        uid = userRecord.uid;
      } else if (userData.login && userData.password) {
        // Utiliser le login comme email temporaire pour l'authentification
        const tempEmail = `${userData.login}@myschool.temp`;
        const authData: any = {
          email: tempEmail,
          password: userData.password,
          displayName: `${userData.firstName} ${userData.lastName}`
        };
        
        // Ajouter le téléphone uniquement s'il est au format valide
        if (userData.phone && userData.phone.startsWith('+')) {
          authData.phoneNumber = userData.phone;
        }
        
        const userRecord = await auth.createUser(authData);
        uid = userRecord.uid;
      } else {
        // Générer un ID Firestore si pas d'auth
        const docRef = await db.collection(this.collectionName).add({});
        uid = docRef.id;
        await docRef.delete(); // Nettoyer le document temporaire
      }

      // Créer l'utilisateur dans Firestore avec l'UID généré
      const user = new UserModel({ ...userData, uid });
      
      // Ne pas sauvegarder le mot de passe en clair dans Firestore
      const userDataToSave = { ...user.toJSON() };
      delete userDataToSave.password;
      
      await db.collection(this.collectionName).doc(uid).set(userDataToSave);
      
      return user;
    } catch (error: any) {
      if (error.code === 'auth/email-already-exists') {
        throw new Error('Cet email est déjà utilisé');
      }
      if (error.code === 'auth/invalid-password') {
        throw new Error('Le mot de passe doit contenir au moins 6 caractères');
      }
      if (error.code === 'auth/invalid-email') {
        throw new Error('Email invalide');
      }
      if (error.code === 'auth/phone-number-already-exists') {
        throw new Error('Ce numéro de téléphone est déjà utilisé');
      }
      throw error;
    }
  }

  async getById(uid: string): Promise<UserModel | null> {
    // Format recommandé : UID Firebase Auth comme ID de document
    const doc = await db.collection(this.collectionName).doc(uid).get();
    
    if (doc.exists) {
      return new UserModel({ ...doc.data() as User, uid: doc.id });
    }
    
    // Format legacy : UID stocké dans un champ 'uid'  
    const snapshot = await db.collection(this.collectionName)
      .where('uid', '==', uid)
      .limit(1)
      .get();
    
    if (!snapshot.empty) {
      const userDoc = snapshot.docs[0];
      return new UserModel({ ...userDoc.data() as User, uid: userDoc.data().uid });
    }
    
    return null;
  }

  async getByEmail(email: string): Promise<UserModel | null> {
    const snapshot = await db.collection(this.collectionName)
      .where('email', '==', email)
      .limit(1)
      .get();
    
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return new UserModel({ ...doc.data() as User, uid: doc.id });
    }
    return null;
  }

  async getByPhone(phone: string): Promise<UserModel | null> {
    const snapshot = await db.collection(this.collectionName)
      .where('phone', '==', phone)
      .limit(1)
      .get();
    
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return new UserModel({ ...doc.data() as User, uid: doc.id });
    }
    return null;
  }

  async getAll(): Promise<UserModel[]> {
    const snapshot = await db.collection(this.collectionName).get();
    return snapshot.docs.map(doc => 
      new UserModel({ ...doc.data() as User, uid: doc.id })
    );
  }

  async getByRole(role: string): Promise<UserModel[]> {
    const snapshot = await db.collection(this.collectionName)
      .where('role.libelle', '==', role)
      .get();
    
    return snapshot.docs.map(doc => 
      new UserModel({ ...doc.data() as User, uid: doc.id })
    );
  }

  async getByStatus(status: string): Promise<UserModel[]> {
    const snapshot = await db.collection(this.collectionName)
      .where('status', '==', status)
      .get();
    
    return snapshot.docs.map(doc => 
      new UserModel({ ...doc.data() as User, uid: doc.id })
    );
  }

  async update(uid: string, userData: Partial<User>): Promise<void> {
    const updateData = { ...userData, updatedAt: new Date() };
    await db.collection(this.collectionName).doc(uid).update(updateData);
  }

  async delete(uid: string): Promise<void> {
    // Supprimer de Firestore
    await db.collection(this.collectionName).doc(uid).delete();
    
    // Supprimer de Firebase Auth (Admin SDK permet cela)
    try {
      await auth.deleteUser(uid);
    } catch (error) {
      console.warn('Utilisateur non trouvé dans Auth:', uid);
    }
  }

  async updateProfileImage(uid: string, profileImageBase64: string): Promise<void> {
    await this.update(uid, { 
      profileImageBase64, 
      profileImageUpdated: new Date() 
    });
  }

  async updateStatus(uid: string, status: 'active' | 'inactive' | 'suspended'): Promise<void> {
    await this.update(uid, { status });
  }
}
