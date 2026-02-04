export type NiveauScolaire = 'ELEMENTAIRE' | 'MOYEN' | 'SECONDAIRE' | 'UNIVERSITAIRE';

export interface Course {
  id: string;
  title: string;
  description: string;
  
  // Nouveau système de hiérarchie
  niveauScolaire: NiveauScolaire;  // ELEMENTAIRE, MOYEN, SECONDAIRE, UNIVERSITAIRE
  matiereId?: string;              // ID de la matière (pour tous niveaux)
  classe?: string;                 // Classe (pour ELEMENTAIRE uniquement: CM1, CM2, etc.)
  
  category: string;                // Sous-domaine du cours (Algèbre, Géométrie, etc.)
  type: 'En ligne' | 'VIDEO' | 'Hybrid';
  level: 'DEBUTANT' | 'INTERMEDIAIRE' | 'AVANCE';
  duration: number; // en minutes ou sessions
  sessions: number;
  price: number;
  rating: number;
  image: string;
  isPublished: boolean;
  certificateAvailable: boolean;
  chaptersIds: string[];
  chapters: any[];
  exercises: number;
  enrolledUsers?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class CourseModel implements Course {
  id: string;
  title: string;
  description: string;
  
  niveauScolaire: NiveauScolaire;
  matiereId?: string;
  classe?: string;
  
  category: string;
  type: 'En ligne' | 'VIDEO' | 'Hybrid';
  level: 'DEBUTANT' | 'INTERMEDIAIRE' | 'AVANCE';
  duration: number;
  sessions: number;
  price: number;
  rating: number;
  image: string;
  isPublished: boolean;
  certificateAvailable: boolean;
  instructorId?: string;
  chaptersIds: string[];
  chapters: any[];
  exercises: number;
  enrolledUsers?: string[];
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<Course>) {
    this.id = data.id || '';
    this.title = data.title || '';
    this.description = data.description || '';
    
    this.niveauScolaire = data.niveauScolaire || 'MOYEN';
    this.matiereId = data.matiereId;
    this.classe = data.classe;
    
    this.category = data.category || '';
    this.type = data.type || 'En ligne';
    this.level = data.level || 'DEBUTANT';
    this.duration = data.duration || 0;
    this.sessions = data.sessions || 0;
    this.price = data.price || 0;
    this.rating = data.rating || 0;
    this.image = data.image || '';
    this.isPublished = data.isPublished !== undefined ? data.isPublished : false;
    this.certificateAvailable = data.certificateAvailable !== undefined ? data.certificateAvailable : false;
    this.instructorId = data.instructorId;
    this.chaptersIds = data.chaptersIds || [];
    this.chapters = data.chapters || [];
    this.exercises = data.exercises || 0;
    this.enrolledUsers = data.enrolledUsers || [];
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  toJSON(): any {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      
      niveauScolaire: this.niveauScolaire,
      matiereId: this.matiereId,
      classe: this.classe,
      
      category: this.category,
      type: this.type,
      level: this.level,
      duration: this.duration,
      sessions: this.sessions,
      price: this.price,
      rating: this.rating,
      image: this.image,
      isPublished: this.isPublished,
      certificateAvailable: this.certificateAvailable,
      instructorId: this.instructorId,
      chaptersIds: this.chaptersIds,
      chapters: this.chapters,
      exercises: this.exercises,
      enrolledUsers: this.enrolledUsers,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
