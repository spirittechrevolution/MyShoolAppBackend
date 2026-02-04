/**
 * Modèle pour les matières scolaires
 * Une matière est liée à un niveau scolaire spécifique
 */

export type NiveauScolaire = 
  | 'ELEMENTAIRE'
  | 'MOYEN'
  | 'SECONDAIRE'
  | 'UNIVERSITAIRE';

export interface Matiere {
  id?: string;
  nom: string;                      // Ex: "Mathématiques", "Physique-Chimie", "SVT"
  niveauScolaire: NiveauScolaire;   // Niveau auquel cette matière appartient
  description?: string;
  icone?: string;                   // Émoji ou URL d'icône
  ordre?: number;                   // Pour l'affichage
  isActive: boolean;                // Matière disponible ou non
  
  createdAt: Date | any;
  updatedAt?: Date | any;
}

export class MatiereModel implements Matiere {
  id?: string;
  nom: string;
  niveauScolaire: NiveauScolaire;
  description?: string;
  icone?: string;
  ordre?: number;
  isActive: boolean;
  createdAt: Date | any;
  updatedAt?: Date | any;

  constructor(data: Partial<Matiere>) {
    this.id = data.id;
    this.nom = data.nom || '';
    this.niveauScolaire = data.niveauScolaire || 'MOYEN';
    this.description = data.description;
    this.icone = data.icone;
    this.ordre = data.ordre || 0;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt;
  }

  toJSON(): any {
    return {
      id: this.id,
      nom: this.nom,
      niveauScolaire: this.niveauScolaire,
      description: this.description,
      icone: this.icone,
      ordre: this.ordre,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

/**
 * Liste des matières par défaut par niveau
 */
export const DEFAULT_MATIERES: Record<NiveauScolaire, string[]> = {
  ELEMENTAIRE: [
    'Mathématiques',
    'Français',
    'Anglais',
    'Sciences',
    'Histoire-Géographie',
    'Éducation Civique',
    'Arts',
    'Sport'
  ],
  MOYEN: [
    'Mathématiques',
    'Physique-Chimie',
    'SVT',
    'Français',
    'Anglais',
    'Espagnol',
    'Arabe',
    'Histoire-Géographie',
    'Éducation Civique',
    'Informatique'
  ],
  SECONDAIRE: [
    'Mathématiques',
    'Physique-Chimie',
    'SVT',
    'Français',
    'Anglais',
    'Espagnol',
    'Arabe',
    'Histoire-Géographie',
    'Philosophie',
    'Informatique',
    'Économie'
  ],
  UNIVERSITAIRE: [
    'Mathématiques',
    'Physique',
    'Chimie',
    'Biologie',
    'Informatique',
    'Droit',
    'Économie',
    'Gestion',
    'Littérature',
    'Langues'
  ]
};
