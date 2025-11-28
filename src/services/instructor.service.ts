import { db } from '../config/firebase.config';
import { InstructorModel, Instructor } from '../models';

export class InstructorService {
  private collectionName = 'instructors';

  async create(instructorData: Partial<Instructor>): Promise<InstructorModel> {
    const instructor = new InstructorModel(instructorData);
    const docRef = await db.collection(this.collectionName).add(instructor.toJSON());
    instructor.id = docRef.id;
    await docRef.update({ id: docRef.id });
    return instructor;
  }

  async getById(id: string): Promise<InstructorModel | null> {
    const doc = await db.collection(this.collectionName).doc(id).get();
    
    if (doc.exists) {
      return new InstructorModel({ ...doc.data() as Instructor, id: doc.id });
    }
    return null;
  }

  async getAll(): Promise<InstructorModel[]> {
    const snapshot = await db.collection(this.collectionName).get();
    return snapshot.docs.map(doc => 
      new InstructorModel({ ...doc.data() as Instructor, id: doc.id })
    );
  }

  async getByCourse(courseId: string): Promise<InstructorModel[]> {
    const snapshot = await db.collection(this.collectionName)
      .where('coursesIds', 'array-contains', courseId)
      .get();
    
    return snapshot.docs.map(doc => 
      new InstructorModel({ ...doc.data() as Instructor, id: doc.id })
    );
  }

  async getByExpertise(expertiseId: string): Promise<InstructorModel[]> {
    const snapshot = await db.collection(this.collectionName)
      .where('expertiseIds', 'array-contains', expertiseId)
      .get();
    
    return snapshot.docs.map(doc => 
      new InstructorModel({ ...doc.data() as Instructor, id: doc.id })
    );
  }

  async update(id: string, instructorData: Partial<Instructor>): Promise<void> {
    await db.collection(this.collectionName).doc(id).update(instructorData);
  }

  async delete(id: string): Promise<void> {
    await db.collection(this.collectionName).doc(id).delete();
  }

  async addCourse(instructorId: string, courseId: string): Promise<void> {
    const instructor = await this.getById(instructorId);
    if (instructor) {
      const coursesIds = instructor.coursesIds || [];
      if (!coursesIds.includes(courseId)) {
        coursesIds.push(courseId);
        await this.update(instructorId, { coursesIds });
      }
    }
  }

  async removeCourse(instructorId: string, courseId: string): Promise<void> {
    const instructor = await this.getById(instructorId);
    if (instructor) {
      const coursesIds = (instructor.coursesIds || []).filter(id => id !== courseId);
      await this.update(instructorId, { coursesIds });
    }
  }

  async addExpertise(instructorId: string, expertiseId: string): Promise<void> {
    const instructor = await this.getById(instructorId);
    if (instructor) {
      const expertiseIds = instructor.expertiseIds || [];
      if (!expertiseIds.includes(expertiseId)) {
        expertiseIds.push(expertiseId);
        await this.update(instructorId, { expertiseIds });
      }
    }
  }

  async removeExpertise(instructorId: string, expertiseId: string): Promise<void> {
    const instructor = await this.getById(instructorId);
    if (instructor) {
      const expertiseIds = (instructor.expertiseIds || []).filter(id => id !== expertiseId);
      await this.update(instructorId, { expertiseIds });
    }
  }
}
