export interface Enrollment {
  id?: string;
  userId: string;
  courseId: string;
  courseTitle: string;
  courseImage: string;
  enrolledAt: Date | any;
  status: 'completed' | 'in-progress' | 'cancelled';
  progress: number;
  amount: number;
  paymentMethod: 'orange-money' | 'wave' | 'free-money' | 'card';
  chaptersCompleted: string[];
}

export class EnrollmentModel implements Enrollment {
  id?: string;
  userId: string;
  courseId: string;
  courseTitle: string;
  courseImage: string;
  enrolledAt: Date | any;
  status: 'completed' | 'in-progress' | 'cancelled';
  progress: number;
  amount: number;
  paymentMethod: 'orange-money' | 'wave' | 'free-money' | 'card';
  chaptersCompleted: string[];

  constructor(data: Partial<Enrollment>) {
    this.id = data.id;
    this.userId = data.userId || '';
    this.courseId = data.courseId || '';
    this.courseTitle = data.courseTitle || '';
    this.courseImage = data.courseImage || '';
    this.enrolledAt = data.enrolledAt || new Date();
    this.status = data.status || 'in-progress';
    this.progress = data.progress || 0;
    this.amount = data.amount || 0;
    this.paymentMethod = data.paymentMethod || 'free-money';
    this.chaptersCompleted = data.chaptersCompleted || [];
  }

  toJSON(): any {
    const json: any = {
      userId: this.userId,
      courseId: this.courseId,
      courseTitle: this.courseTitle,
      courseImage: this.courseImage,
      enrolledAt: this.enrolledAt,
      status: this.status,
      progress: this.progress,
      amount: this.amount,
      paymentMethod: this.paymentMethod,
      chaptersCompleted: this.chaptersCompleted
    };
    
    if (this.id) {
      json.id = this.id;
    }
    
    return json;
  }
}
