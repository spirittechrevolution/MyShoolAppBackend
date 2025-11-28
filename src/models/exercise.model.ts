export interface Question {
  id: string;
  question: string;
  options?: string[];
  correctAnswer?: string;
}

export interface TestCase {
  input: any;
  expected: any;
}

export interface Exercise {
  id: string;
  courseId: string;
  chapterId: string;
  title: string;
  type: 'qcm' | 'code';
  difficulty: 'facile' | 'moyen' | 'difficile' | 'avancé';
  duration: string;
  instructions?: string;
  questions?: Question[];
  templateCode?: string;
  testCases?: TestCase[];
}

export class ExerciseModel implements Exercise {
  id: string;
  courseId: string;
  chapterId: string;
  title: string;
  type: 'qcm' | 'code';
  difficulty: 'facile' | 'moyen' | 'difficile' | 'avancé';
  duration: string;
  instructions?: string;
  questions?: Question[];
  templateCode?: string;
  testCases?: TestCase[];

  constructor(data: Partial<Exercise>) {
    this.id = data.id || '';
    this.courseId = data.courseId || '';
    this.chapterId = data.chapterId || '';
    this.title = data.title || '';
    this.type = data.type || 'qcm';
    this.difficulty = data.difficulty || 'facile';
    this.duration = data.duration || '15min';
    this.instructions = data.instructions;
    this.questions = data.questions || [];
    this.templateCode = data.templateCode;
    this.testCases = data.testCases || [];
  }

  toJSON(): any {
    return {
      id: this.id,
      courseId: this.courseId,
      chapterId: this.chapterId,
      title: this.title,
      type: this.type,
      difficulty: this.difficulty,
      duration: this.duration,
      instructions: this.instructions,
      questions: this.questions,
      templateCode: this.templateCode,
      testCases: this.testCases
    };
  }
}
