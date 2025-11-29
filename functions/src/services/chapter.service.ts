import { db } from '../config/firebase.config';
import { ChapterModel, Chapter } from '../models';

export class ChapterService {
  private collectionName = 'chapters';

  async create(chapterData: Partial<Chapter>): Promise<ChapterModel> {
    const chapter = new ChapterModel(chapterData);
    const docRef = await db.collection(this.collectionName).add(chapter.toJSON());
    chapter.id = docRef.id;
    await docRef.update({ id: docRef.id });
    return chapter;
  }

  async getById(id: string): Promise<ChapterModel | null> {
    const doc = await db.collection(this.collectionName).doc(id).get();
    
    if (doc.exists) {
      return new ChapterModel({ ...doc.data() as Chapter, id: doc.id });
    }
    return null;
  }

  async getAll(): Promise<ChapterModel[]> {
    const snapshot = await db.collection(this.collectionName).get();
    return snapshot.docs.map(doc => 
      new ChapterModel({ ...doc.data() as Chapter, id: doc.id })
    );
  }

  async getByCourseId(courseId: string): Promise<ChapterModel[]> {
    const snapshot = await db.collection(this.collectionName)
      .where('courseId', '==', courseId)
      .orderBy('order', 'asc')
      .get();
    
    return snapshot.docs.map(doc => 
      new ChapterModel({ ...doc.data() as Chapter, id: doc.id })
    );
  }

  async update(id: string, chapterData: Partial<Chapter>): Promise<void> {
    await db.collection(this.collectionName).doc(id).update(chapterData);
  }

  async delete(id: string): Promise<void> {
    await db.collection(this.collectionName).doc(id).delete();
  }

  async addLesson(chapterId: string, lessonId: string): Promise<void> {
    const chapter = await this.getById(chapterId);
    if (chapter) {
      const lessonsIds = chapter.lessonsIds || [];
      if (!lessonsIds.includes(lessonId)) {
        lessonsIds.push(lessonId);
        await this.update(chapterId, { lessonsIds });
      }
    }
  }

  async removeLesson(chapterId: string, lessonId: string): Promise<void> {
    const chapter = await this.getById(chapterId);
    if (chapter) {
      const lessonsIds = (chapter.lessonsIds || []).filter(id => id !== lessonId);
      await this.update(chapterId, { lessonsIds });
    }
  }

  async addExercise(chapterId: string, exerciseId: string): Promise<void> {
    const chapter = await this.getById(chapterId);
    if (chapter) {
      const exercisesIds = chapter.exercisesIds || [];
      if (!exercisesIds.includes(exerciseId)) {
        exercisesIds.push(exerciseId);
        await this.update(chapterId, { exercisesIds });
      }
    }
  }

  async removeExercise(chapterId: string, exerciseId: string): Promise<void> {
    const chapter = await this.getById(chapterId);
    if (chapter) {
      const exercisesIds = (chapter.exercisesIds || []).filter(id => id !== exerciseId);
      await this.update(chapterId, { exercisesIds });
    }
  }
}
