import { db } from '../config/firebase.config';
import { ExerciseModel, Exercise } from '../models';

export class ExerciseService {
  private collectionName = 'exercises';

  async create(exerciseData: Partial<Exercise>): Promise<ExerciseModel> {
    const exercise = new ExerciseModel(exerciseData);
    const docRef = await db.collection(this.collectionName).add(exercise.toJSON());
    exercise.id = docRef.id;
    await docRef.update({ id: docRef.id });
    return exercise;
  }

  async getById(id: string): Promise<ExerciseModel | null> {
    const doc = await db.collection(this.collectionName).doc(id).get();
    
    if (doc.exists) {
      return new ExerciseModel({ ...doc.data() as Exercise, id: doc.id });
    }
    return null;
  }

  async getAll(): Promise<ExerciseModel[]> {
    const snapshot = await db.collection(this.collectionName).get();
    return snapshot.docs.map(doc => 
      new ExerciseModel({ ...doc.data() as Exercise, id: doc.id })
    );
  }

  async getByCourseId(courseId: string): Promise<ExerciseModel[]> {
    const snapshot = await db.collection(this.collectionName)
      .where('courseId', '==', courseId)
      .get();
    
    return snapshot.docs.map(doc => 
      new ExerciseModel({ ...doc.data() as Exercise, id: doc.id })
    );
  }

  async getByChapterId(chapterId: string): Promise<ExerciseModel[]> {
    const snapshot = await db.collection(this.collectionName)
      .where('chapterId', '==', chapterId)
      .get();
    
    return snapshot.docs.map(doc => 
      new ExerciseModel({ ...doc.data() as Exercise, id: doc.id })
    );
  }

  async getByType(type: 'qcm' | 'code'): Promise<ExerciseModel[]> {
    const snapshot = await db.collection(this.collectionName)
      .where('type', '==', type)
      .get();
    
    return snapshot.docs.map(doc => 
      new ExerciseModel({ ...doc.data() as Exercise, id: doc.id })
    );
  }

  async getByDifficulty(difficulty: string): Promise<ExerciseModel[]> {
    const snapshot = await db.collection(this.collectionName)
      .where('difficulty', '==', difficulty)
      .get();
    
    return snapshot.docs.map(doc => 
      new ExerciseModel({ ...doc.data() as Exercise, id: doc.id })
    );
  }

  async update(id: string, exerciseData: Partial<Exercise>): Promise<void> {
    await db.collection(this.collectionName).doc(id).update(exerciseData);
  }

  async delete(id: string): Promise<void> {
    await db.collection(this.collectionName).doc(id).delete();
  }
}
