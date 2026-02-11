import { db } from '../config/firebase.config';
import { MatiereModel, Matiere, NiveauScolaire } from '../models';

export class MatiereService {
  private collectionName = 'matieres';

  /**
   * Créer une matière
   */
  async create(matiereData: Partial<Matiere>): Promise<MatiereModel> {
    const matiere = new MatiereModel(matiereData);
    const docRef = await db.collection(this.collectionName).add(matiere.toJSON());
    matiere.id = docRef.id;
    return matiere;
  }

  /**
   * Récupérer une matière par ID
   */
  async getById(id: string): Promise<MatiereModel | null> {
    const doc = await db.collection(this.collectionName).doc(id).get();
    
    if (doc.exists) {
      return new MatiereModel({ ...doc.data() as Matiere, id: doc.id });
    }
    return null;
  }

  /**
   * Récupérer toutes les matières
   */
  async getAll(): Promise<MatiereModel[]> {
    const snapshot = await db.collection(this.collectionName)
      .where('isActive', '==', true)
      .orderBy('ordre', 'asc')
      .get();
    
    return snapshot.docs.map(doc => 
      new MatiereModel({ ...doc.data() as Matiere, id: doc.id })
    );
  }

  /**
   * Récupérer les matières par niveau scolaire
   */
  async getByNiveau(niveauScolaire: NiveauScolaire): Promise<MatiereModel[]> {
    const snapshot = await db.collection(this.collectionName)
      .where('niveauScolaire', '==', niveauScolaire)
      .where('isActive', '==', true)
      .orderBy('ordre', 'asc')
      .get();
    
    return snapshot.docs.map(doc => 
      new MatiereModel({ ...doc.data() as Matiere, id: doc.id })
    );
  }

  /**
   * Récupérer les matières par classe précise
   */
  async getByClasse(classe: string): Promise<MatiereModel[]> {
    const snapshot = await db.collection(this.collectionName)
      .where('classe', '==', classe)
      .where('isActive', '==', true)
      .orderBy('ordre', 'asc')
      .get();
    
    return snapshot.docs.map(doc => 
      new MatiereModel({ ...doc.data() as Matiere, id: doc.id })
    );
  }

  /**
   * Mettre à jour une matière
   */
  async update(id: string, matiereData: Partial<Matiere>): Promise<void> {
    const updateData = { ...matiereData, updatedAt: new Date() };
    await db.collection(this.collectionName).doc(id).update(updateData);
  }

  /**
   * Supprimer une matière (soft delete)
   */
  async delete(id: string): Promise<void> {
    await this.update(id, { isActive: false });
  }

  /**
   * Vérifier si une matière appartient à un niveau scolaire (par ID)
   */
  async belongsToNiveau(matiereId: string, niveauScolaire: NiveauScolaire): Promise<boolean> {
    const matiere = await this.getById(matiereId);
    return matiere !== null && matiere.niveauScolaire === niveauScolaire;
  }

  /**
   * Vérifier si une matière appartient à un niveau scolaire (par NOM)
   */
  async belongsToNiveauByName(matiereNom: string, niveauScolaire: NiveauScolaire): Promise<boolean> {
    try {
      const snapshot = await db.collection(this.collectionName)
        .where('nom', '==', matiereNom)
        .where('niveauScolaire', '==', niveauScolaire)
        .where('isActive', '==', true)
        .limit(1)
        .get();

      return !snapshot.empty;
    } catch (error) {
      console.error(`❌ Erreur vérification matière "${matiereNom}" pour niveau ${niveauScolaire}:`, error);
      return false;
    }
  }

  /**
   * Valider que des matières appartiennent toutes au même niveau (par NOMS)
   */
  async validateMatieresForNiveau(matiereNoms: string[], niveauScolaire: NiveauScolaire): Promise<boolean> {
    console.log(`🔍 Validation de ${matiereNoms.length} matières pour niveau ${niveauScolaire}:`, matiereNoms);
    
    for (const matiereNom of matiereNoms) {
      const belongs = await this.belongsToNiveauByName(matiereNom, niveauScolaire);
      if (!belongs) {
        console.error(`❌ Matière "${matiereNom}" non trouvée pour niveau ${niveauScolaire}`);
        return false;
      }
      console.log(`✅ Matière "${matiereNom}" validée pour niveau ${niveauScolaire}`);
    }
    
    console.log(`✅ Toutes les matières sont valides pour niveau ${niveauScolaire}`);
    return true;
  }
}

export const matiereService = new MatiereService();
