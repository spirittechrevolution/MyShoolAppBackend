export interface Lesson {
  id: string;
  courseId: string;
  chapterId: string;
  title: string;
  type: 'video' | 'text' | 'quiz';
  duration: string;
  order: number;
}

export class LessonModel implements Lesson {
  id: string;
  courseId: string;
  chapterId: string;
  title: string;
  type: 'video' | 'text' | 'quiz';
  duration: string;
  order: number;

  constructor(data: Partial<Lesson>) {
    this.id = data.id || '';
    this.courseId = data.courseId || '';
    this.chapterId = data.chapterId || '';
    this.title = data.title || '';
    this.type = data.type || 'video';
    this.duration = data.duration || '0:00';
    this.order = data.order || 1;
  }

  toJSON(): any {
    return {
      id: this.id,
      courseId: this.courseId,
      chapterId: this.chapterId,
      title: this.title,
      type: this.type,
      duration: this.duration,
      order: this.order
    };
  }
}
