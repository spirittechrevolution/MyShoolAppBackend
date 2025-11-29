import { db } from '../config/firebase.config';
import { EnrollmentModel, Enrollment } from '../models';

export class EnrollmentService {
  private collectionName = 'enrollments';

  async create(enrollmentData: Partial<Enrollment>): Promise<EnrollmentModel> {
    const enrollment = new EnrollmentModel(enrollmentData);
    const docRef = await db.collection(this.collectionName).add(enrollment.toJSON());
    enrollment.userId = docRef.id;
    return enrollment;
  }

  async getById(id: string): Promise<EnrollmentModel | null> {
    const doc = await db.collection(this.collectionName).doc(id).get();
    
    if (doc.exists) {
      return new EnrollmentModel(doc.data() as Enrollment);
    }
    return null;
  }

  async getAll(): Promise<EnrollmentModel[]> {
    const snapshot = await db.collection(this.collectionName).get();
    return snapshot.docs.map(doc => 
      new EnrollmentModel(doc.data() as Enrollment)
    );
  }

  async getByUserId(userId: string): Promise<EnrollmentModel[]> {
    const snapshot = await db.collection(this.collectionName)
      .where('userId', '==', userId)
      .orderBy('enrolledAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => 
      new EnrollmentModel(doc.data() as Enrollment)
    );
  }

  async getByCourseId(courseId: string): Promise<EnrollmentModel[]> {
    const snapshot = await db.collection(this.collectionName)
      .where('courseId', '==', courseId)
      .get();
    
    return snapshot.docs.map(doc => 
      new EnrollmentModel(doc.data() as Enrollment)
    );
  }

  async getByStatus(status: string): Promise<EnrollmentModel[]> {
    const snapshot = await db.collection(this.collectionName)
      .where('status', '==', status)
      .get();
    
    return snapshot.docs.map(doc => 
      new EnrollmentModel(doc.data() as Enrollment)
    );
  }

  async getUserEnrollment(userId: string, courseId: string): Promise<EnrollmentModel | null> {
    const snapshot = await db.collection(this.collectionName)
      .where('userId', '==', userId)
      .where('courseId', '==', courseId)
      .get();
    
    if (!snapshot.empty) {
      return new EnrollmentModel(snapshot.docs[0].data() as Enrollment);
    }
    return null;
  }

  async update(id: string, enrollmentData: Partial<Enrollment>): Promise<void> {
    await db.collection(this.collectionName).doc(id).update(enrollmentData);
  }

  async delete(id: string): Promise<void> {
    await db.collection(this.collectionName).doc(id).delete();
  }

  async updateProgress(id: string, progress: number): Promise<void> {
    await this.update(id, { progress });
  }

  async updateStatus(id: string, status: 'completed' | 'in-progress' | 'cancelled'): Promise<void> {
    await this.update(id, { status });
  }

  async addCompletedChapter(id: string, chapterId: string): Promise<void> {
    const enrollment = await this.getById(id);
    if (enrollment) {
      const chaptersCompleted = enrollment.chaptersCompleted || [];
      if (!chaptersCompleted.includes(chapterId)) {
        chaptersCompleted.push(chapterId);
        await this.update(id, { chaptersCompleted });
      }
    }
  }
}
