export interface Instructor {
  id: string;
  name: string;
  title: string;
  bio: string;
  image: string;
  backgroundColor: string;
  rating: number;
  coursesIds: string[];
  expertiseIds: string[];
}

export class InstructorModel implements Instructor {
  id: string;
  name: string;
  title: string;
  bio: string;
  image: string;
  backgroundColor: string;
  rating: number;
  coursesIds: string[];
  expertiseIds: string[];

  constructor(data: Partial<Instructor>) {
    this.id = data.id || '';
    this.name = data.name || '';
    this.title = data.title || '';
    this.bio = data.bio || '';
    this.image = data.image || '';
    this.backgroundColor = data.backgroundColor || '#000000';
    this.rating = data.rating || 0;
    this.coursesIds = data.coursesIds || [];
    this.expertiseIds = data.expertiseIds || [];
  }

  toJSON(): any {
    return {
      id: this.id,
      name: this.name,
      title: this.title,
      bio: this.bio,
      image: this.image,
      backgroundColor: this.backgroundColor,
      rating: this.rating,
      coursesIds: this.coursesIds,
      expertiseIds: this.expertiseIds
    };
  }
}
