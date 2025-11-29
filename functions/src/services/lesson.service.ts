import { db } from '../config/firebase.config';
import { LessonModel, Lesson } from '../models';

export class LessonService {
  private collectionName = 'lessons';

  async create(lessonData: Partial<Lesson>): Promise<LessonModel> {
    const lesson = new LessonModel(lessonData);
    const docRef = await db.collection(this.collectionName).add(lesson.toJSON());
    lesson.id = docRef.id;
    await docRef.update({ id: docRef.id });
    return lesson;
  }

  async getById(id: string): Promise<LessonModel | null> {
    const doc = await db.collection(this.collectionName).doc(id).get();
    
    if (doc.exists) {
      return new LessonModel({ ...doc.data() as Lesson, id: doc.id });
    }
    return null;
  }

  async getAll(): Promise<LessonModel[]> {
    const snapshot = await db.collection(this.collectionName).get();
    return snapshot.docs.map(doc => 
      new LessonModel({ ...doc.data() as Lesson, id: doc.id })
    );
  }

  async getByCourseId(courseId: string): Promise<LessonModel[]> {
    const snapshot = await db.collection(this.collectionName)
      .where('courseId', '==', courseId)
      .orderBy('order', 'asc')
      .get();
    
    return snapshot.docs.map(doc => 
      new LessonModel({ ...doc.data() as Lesson, id: doc.id })
    );
  }

  async getByChapterId(chapterId: string): Promise<LessonModel[]> {
    const snapshot = await db.collection(this.collectionName)
      .where('chapterId', '==', chapterId)
      .orderBy('order', 'asc')
      .get();
    
    return snapshot.docs.map(doc => 
      new LessonModel({ ...doc.data() as Lesson, id: doc.id })
    );
  }

  async getByType(type: string): Promise<LessonModel[]> {
    const snapshot = await db.collection(this.collectionName)
      .where('type', '==', type)
      .get();
    
    return snapshot.docs.map(doc => 
      new LessonModel({ ...doc.data() as Lesson, id: doc.id })
    );
  }

  async update(id: string, lessonData: Partial<Lesson>): Promise<void> {
    await db.collection(this.collectionName).doc(id).update(lessonData);
  }

  async delete(id: string): Promise<void> {
    await db.collection(this.collectionName).doc(id).delete();
  }
}
