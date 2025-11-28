export interface Chapter {
  id: string;
  courseId: string;
  title: string;
  description: string;
  duration: string;
  order: number;
  lessonsIds?: string[];
  exercisesIds?: string[];
}

export class ChapterModel implements Chapter {
  id: string;
  courseId: string;
  title: string;
  description: string;
  duration: string;
  order: number;
  lessonsIds?: string[];
  exercisesIds?: string[];

  constructor(data: Partial<Chapter>) {
    this.id = data.id || '';
    this.courseId = data.courseId || '';
    this.title = data.title || '';
    this.description = data.description || '';
    this.duration = data.duration || '0h 0min';
    this.order = data.order || 1;
    this.lessonsIds = data.lessonsIds || [];
    this.exercisesIds = data.exercisesIds || [];
  }

  toJSON(): any {
    return {
      id: this.id,
      courseId: this.courseId,
      title: this.title,
      description: this.description,
      duration: this.duration,
      order: this.order,
      lessonsIds: this.lessonsIds,
      exercisesIds: this.exercisesIds
    };
  }
}
