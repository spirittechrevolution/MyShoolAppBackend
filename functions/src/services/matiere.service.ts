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

  /**
   * Déterminer la classe commune à partir des noms de matières
   * Pour MOYEN/SECONDAIRE/UNIVERSITAIRE où la classe n'est pas obligatoire dans le profil user
   * @param matiereNoms Liste des noms de matières sélectionnées
   * @param niveauScolaire Niveau scolaire pour filtrer
   * @returns La classe commune ou null si les matières n'ont pas la même classe
   */
  async getClasseFromMatieres(matiereNoms: string[], niveauScolaire: NiveauScolaire, expectedClasse?: string): Promise<string | null> {
    try {
      console.log(`📚 Détermination de la classe à partir des matières pour ${niveauScolaire}:`, matiereNoms, expectedClasse ? `(classe attendue: ${expectedClasse})` : '');
      
      if (!matiereNoms || matiereNoms.length === 0) {
        console.error('❌ Aucune matière fournie');
        return null;
      }

      const classes: string[] = [];
      let hasInactiveMatieres = false;
      
      for (const matiereNom of matiereNoms) {
        // Construire la requête de base
        let query = db.collection(this.collectionName)
          .where('nom', '==', matiereNom)
          .where('niveauScolaire', '==', niveauScolaire)
          .where('isActive', '==', true);
        
        // Ajouter constraint de classe si fournie
        if (expectedClasse) {
          query = query.where('classe', '==', expectedClasse);
        }
        
        let snapshot = await query.limit(1).get();

        // Fallback: chercher SANS constraint isActive si pas trouvée
        if (snapshot.empty && !expectedClasse) {
          console.warn(`⚠️  Matière active "${matiereNom}" non trouvée pour ${niveauScolaire}, cherche en fallback...`);
          snapshot = await db.collection(this.collectionName)
            .where('nom', '==', matiereNom)
            .where('niveauScolaire', '==', niveauScolaire)
            .limit(1)
            .get();
          
          if (!snapshot.empty) {
            hasInactiveMatieres = true;
            console.warn(`⚠️  Matière trouvée mais INACTIVE: "${matiereNom}"`);
          }
        }

        if (snapshot.empty) {
          // Dernier fallback: chercher TOUTES les matières pour ce niveau pour debug
          console.error(`❌ Matière "${matiereNom}" non trouvée du tout pour ${niveauScolaire}${expectedClasse ? ` + classe ${expectedClasse}` : ''}`);
          const allMatieres = await db.collection(this.collectionName)
            .where('niveauScolaire', '==', niveauScolaire)
            .limit(10)
            .get();
          const availableMatieres = allMatieres.docs.map(doc => ({ nom: doc.data().nom, classe: doc.data().classe, isActive: doc.data().isActive }));
          console.error(`   Matières disponibles pour ${niveauScolaire}:`, availableMatieres);
          return null;
        }

        const matiereData = snapshot.docs[0].data();
        if (matiereData.classe) {
          classes.push(matiereData.classe);
          console.log(`   ✅ Matière "${matiereNom}" → classe "${matiereData.classe}"`);
        } else {
          console.error(`❌ Matière "${matiereNom}" n'a pas de classe définie`);
          return null;
        }
      }

      if (classes.length === 0) {
        console.error('❌ Aucune classe trouvée pour les matières');
        return null;
      }

      // Vérifier que toutes les matières ont la même classe
      const uniqueClasses = [...new Set(classes)];
      if (uniqueClasses.length > 1) {
        console.error(`❌ Les matières n'ont pas la même classe: ${uniqueClasses.join(', ')}`);
        return null;
      }

      if (hasInactiveMatieres) {
        console.warn(`⚠️  ATTENTION: Une ou plusieurs matières sont INACTIVES. Classe déterminée: ${uniqueClasses[0]}`);
      } else {
        console.log(`✅ Classe déterminée: ${uniqueClasses[0]}`);
      }
      
      return uniqueClasses[0];
    } catch (error) {
      console.error('❌ Erreur lors de la détermination de la classe:', error);
      return null;
    }
  }
}

export const matiereService = new MatiereService();
