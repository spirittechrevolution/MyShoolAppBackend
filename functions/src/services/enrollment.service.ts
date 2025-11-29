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
      return new EnrollmentModel({ ...doc.data() as Enrollment, id: doc.id });
    }
    return null;
  }

  async getAll(): Promise<EnrollmentModel[]> {
    const snapshot = await db.collection(this.collectionName).get();
    return snapshot.docs.map(doc => 
      new EnrollmentModel({ ...doc.data() as Enrollment, id: doc.id })
    );
  }

  async getByUserId(userId: string): Promise<EnrollmentModel[]> {
    const snapshot = await db.collection(this.collectionName)
      .where('userId', '==', userId)
      .get();
    
    // Trier en mémoire pour éviter le besoin d'un index composite
    return snapshot.docs
      .map(doc => new EnrollmentModel({ ...doc.data() as Enrollment, id: doc.id }))
      .sort((a, b) => {
        const dateA = a.enrolledAt?.toMillis ? a.enrolledAt.toMillis() : 0;
        const dateB = b.enrolledAt?.toMillis ? b.enrolledAt.toMillis() : 0;
        return dateB - dateA; // Tri décroissant (plus récent en premier)
      });
  }

  async getByCourseId(courseId: string): Promise<EnrollmentModel[]> {
    const snapshot = await db.collection(this.collectionName)
      .where('courseId', '==', courseId)
      .get();
    
    return snapshot.docs.map(doc => 
      new EnrollmentModel({ ...doc.data() as Enrollment, id: doc.id })
    );
  }

  async getByStatus(status: string): Promise<EnrollmentModel[]> {
    const snapshot = await db.collection(this.collectionName)
      .where('status', '==', status)
      .get();
    
    return snapshot.docs.map(doc => 
      new EnrollmentModel({ ...doc.data() as Enrollment, id: doc.id })
    );
  }

  async getUserEnrollment(userId: string, courseId: string): Promise<EnrollmentModel | null> {
    const snapshot = await db.collection(this.collectionName)
      .where('userId', '==', userId)
      .where('courseId', '==', courseId)
      .get();
    
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return new EnrollmentModel({ ...doc.data() as Enrollment, id: doc.id });
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
