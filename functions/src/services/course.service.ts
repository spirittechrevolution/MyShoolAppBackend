import { db } from '../config/firebase.config';
import { CourseModel, Course } from '../models';

export class CourseService {
  private collectionName = 'courses';

  async create(courseData: Partial<Course>): Promise<CourseModel> {
    const course = new CourseModel(courseData);
    const docRef = await db.collection(this.collectionName).add(course.toJSON());
    course.id = docRef.id;
    await docRef.update({ id: docRef.id });
    return course;
  }

  async getById(id: string): Promise<CourseModel | null> {
    const doc = await db.collection(this.collectionName).doc(id).get();
    
    if (doc.exists) {
      return new CourseModel({ ...doc.data() as Course, id: doc.id });
    }
    return null;
  }

  async getAll(): Promise<CourseModel[]> {
    const snapshot = await db.collection(this.collectionName).get();
    return snapshot.docs.map(doc => 
      new CourseModel({ ...doc.data() as Course, id: doc.id })
    );
  }

  async getPublished(): Promise<CourseModel[]> {
    const snapshot = await db.collection(this.collectionName)
      .where('isPublished', '==', true)
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => 
      new CourseModel({ ...doc.data() as Course, id: doc.id })
    );
  }

  async getByCategory(category: string): Promise<CourseModel[]> {
    const snapshot = await db.collection(this.collectionName)
      .where('category', '==', category)
      .where('isPublished', '==', true)
      .get();
    
    return snapshot.docs.map(doc => 
      new CourseModel({ ...doc.data() as Course, id: doc.id })
    );
  }

  async getByLevel(level: string): Promise<CourseModel[]> {
    const snapshot = await db.collection(this.collectionName)
      .where('level', '==', level)
      .where('isPublished', '==', true)
      .get();
    
    return snapshot.docs.map(doc => 
      new CourseModel({ ...doc.data() as Course, id: doc.id })
    );
  }

  async getByType(type: string): Promise<CourseModel[]> {
    const snapshot = await db.collection(this.collectionName)
      .where('type', '==', type)
      .where('isPublished', '==', true)
      .get();
    
    return snapshot.docs.map(doc => 
      new CourseModel({ ...doc.data() as Course, id: doc.id })
    );
  }

  async update(id: string, courseData: Partial<Course>): Promise<void> {
    const updateData = { ...courseData, updatedAt: new Date() };
    await db.collection(this.collectionName).doc(id).update(updateData);
  }

  async delete(id: string): Promise<void> {
    await db.collection(this.collectionName).doc(id).delete();
  }

  async publish(id: string): Promise<void> {
    await this.update(id, { isPublished: true });
  }

  async unpublish(id: string): Promise<void> {
    await this.update(id, { isPublished: false });
  }

  async addEnrolledUser(courseId: string, userId: string): Promise<void> {
    const course = await this.getById(courseId);
    if (course) {
      const enrolledUsers = course.enrolledUsers || [];
      if (!enrolledUsers.includes(userId)) {
        enrolledUsers.push(userId);
        await this.update(courseId, { enrolledUsers });
      }
    }
  }

  async removeEnrolledUser(courseId: string, userId: string): Promise<void> {
    const course = await this.getById(courseId);
    if (course) {
      const enrolledUsers = (course.enrolledUsers || []).filter(id => id !== userId);
      await this.update(courseId, { enrolledUsers });
    }
  }

  async getByInstructor(instructorId: string): Promise<CourseModel[]> {
    const snapshot = await db.collection(this.collectionName)
      .where('instructorId', '==', instructorId)
      .where('isPublished', '==', true)
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => 
      new CourseModel({ ...doc.data() as Course, id: doc.id })
    );
  }

  async getByClasse(classe: string): Promise<CourseModel[]> {
    const snapshot = await db.collection(this.collectionName)
      .where('classe', '==', classe)
      .where('isPublished', '==', true)
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => 
      new CourseModel({ ...doc.data() as Course, id: doc.id })
    );
  }

  async getByMatiere(matiere: string): Promise<CourseModel[]> {
    const snapshot = await db.collection(this.collectionName)
      .where('matiere', '==', matiere)
      .where('isPublished', '==', true)
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => 
      new CourseModel({ ...doc.data() as Course, id: doc.id })
    );
  }

  async getByNiveauScolaire(niveauScolaire: string): Promise<CourseModel[]> {
    const snapshot = await db.collection(this.collectionName)
      .where('niveauScolaire', '==', niveauScolaire)
      .where('isPublished', '==', true)
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => 
      new CourseModel({ ...doc.data() as Course, id: doc.id })
    );
  }
}
