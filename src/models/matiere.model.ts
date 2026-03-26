/**
 * Modèle pour les matières scolaires
 * Une matière est liée à un niveau scolaire spécifique
 */

import { NiveauScolaire } from './user.model';

export interface Matiere {
  id?: string;
  nom: string;                      // Ex: "Mathématiques", "Physique-Chimie", "SVT"
  niveauScolaire: NiveauScolaire;   // Niveau auquel cette matière appartient
  classe?: string;                   // Classe précise (CM2, Licence2, Terminale S, etc.)
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
  classe?: string;
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
    this.classe = data.classe;
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
      classe: this.classe,
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
 * Classes disponibles par niveau scolaire
 */
export const CLASSES_PAR_NIVEAU: Record<NiveauScolaire, string[]> = {
  ELEMENTAIRE: ['CI', 'CP', 'CE1', 'CE2', 'CM1', 'CM2'],
  MOYEN: ['6ème', '5ème', '4ème', '3ème (BFEM)'],
  SECONDAIRE: [
    // Seconde (toutes séries)
    'Seconde L', 'Seconde S', 'Seconde G', 'Seconde T',
    // Première (toutes séries)
    'Première L', 'Première L\'', 'Première S', 'Première G', 'Première T',
    // Terminale (toutes séries avec numérotation)
    'Terminale L1', 'Terminale L2', 'Terminale S1', 'Terminale S2', 'Terminale S3', 'Terminale S4', 'Terminale G', 'Terminale T'
  ],
  UNIVERSITAIRE: ['Licence 1', 'Licence 2', 'Licence 3', 'Master 1', 'Master 2']
};
