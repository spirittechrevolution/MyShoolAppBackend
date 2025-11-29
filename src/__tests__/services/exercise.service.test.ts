import { ExerciseService } from '../../services/exercise.service';

// Mock Firestore
const mockDocGet = jest.fn();
const mockDocUpdate = jest.fn();
const mockDocDelete = jest.fn();
const mockCollectionGet = jest.fn();
const mockCollectionAdd = jest.fn();
const mockWhereGet = jest.fn();
const mockWhere = jest.fn();

jest.mock('../../config/firebase.config', () => ({
  db: {
    collection: jest.fn(() => ({
      add: mockCollectionAdd,
      doc: jest.fn(() => ({
        get: mockDocGet,
        update: mockDocUpdate,
        delete: mockDocDelete,
      })),
      where: mockWhere,
      get: mockCollectionGet,
    })),
  },
}));

describe('ExerciseService', () => {
  let exerciseService: ExerciseService;

  beforeEach(() => {
    exerciseService = new ExerciseService();
    jest.clearAllMocks();
    
    // Setup chainable where
    mockWhere.mockReturnValue({
      get: mockWhereGet,
    });
  });

  describe('create', () => {
    it('should create a new exercise', async () => {
      const mockDocId = 'generated-exercise-id';
      const exerciseData = {
        title: 'Test Exercise',
        chapterId: 'test-chapter',
        courseId: 'test-course',
        type: 'qcm' as const,
        difficulty: 'facile' as const,
        duration: '15min',
        questions: [{
          id: '1',
          question: 'What is 2+2?',
          options: ['2', '3', '4', '5'],
          correctAnswer: '4'
        }],
      };

      mockCollectionAdd.mockResolvedValue({ 
        id: mockDocId,
        update: jest.fn().mockResolvedValue(undefined),
      });

      const exercise = await exerciseService.create(exerciseData);

      expect(exercise).toBeDefined();
      expect(exercise.title).toBe(exerciseData.title);
      expect(exercise.type).toBe(exerciseData.type);
      expect(mockCollectionAdd).toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('should return an exercise by ID', async () => {
      const exerciseId = 'test-exercise-123';
      const mockExerciseData = {
        title: 'Test Exercise',
        chapterId: 'test-chapter',
        courseId: 'test-course',
        type: 'qcm',
        difficulty: 'facile',
        duration: '15min',
        questions: [{
          id: '1',
          question: 'What is 2+2?',
          options: ['2', '3', '4', '5'],
          correctAnswer: '4'
        }],
      };

      mockDocGet.mockResolvedValue({
        exists: true,
        id: exerciseId,
        data: () => mockExerciseData,
      });

      const exercise = await exerciseService.getById(exerciseId);

      expect(exercise).toBeDefined();
      expect(exercise?.id).toBe(exerciseId);
      expect(exercise?.title).toBe('Test Exercise');
    });

    it('should return null for non-existent exercise', async () => {
      mockDocGet.mockResolvedValue({
        exists: false,
        id: 'nonexistent',
        data: () => undefined,
      });

      const exercise = await exerciseService.getById('nonexistent-id');

      expect(exercise).toBeNull();
    });
  });

  describe('getByChapterId', () => {
    it('should return exercises for a chapter', async () => {
      const chapterId = 'test-chapter';
      const mockExercises = [
        {
          id: 'exercise1',
          data: () => ({
            title: 'Exercise 1',
            chapterId: 'test-chapter',
            courseId: 'test-course',
            type: 'qcm',
            difficulty: 'facile',
            duration: '15min',
            questions: [],
          }),
        },
        {
          id: 'exercise2',
          data: () => ({
            title: 'Exercise 2',
            chapterId: 'test-chapter',
            courseId: 'test-course',
            type: 'code',
            difficulty: 'moyen',
            duration: '30min',
            questions: [],
          }),
        },
      ];

      mockWhereGet.mockResolvedValue({
        docs: mockExercises,
      });

      const exercises = await exerciseService.getByChapterId(chapterId);

      expect(Array.isArray(exercises)).toBe(true);
      expect(exercises.length).toBe(2);
      expect(exercises[0].title).toBe('Exercise 1');
    });
  });

  describe('getByCourseId', () => {
    it('should return exercises for a course', async () => {
      const courseId = 'test-course';
      const mockExercises = [
        {
          id: 'exercise1',
          data: () => ({
            title: 'Exercise 1',
            chapterId: 'chapter1',
            courseId: 'test-course',
            type: 'qcm',
            difficulty: 'facile',
            duration: '15min',
            questions: [],
          }),
        },
      ];

      mockWhereGet.mockResolvedValue({
        docs: mockExercises,
      });

      const exercises = await exerciseService.getByCourseId(courseId);

      expect(Array.isArray(exercises)).toBe(true);
      expect(exercises.length).toBe(1);
    });
  });

  describe('update', () => {
    it('should update an exercise', async () => {
      const exerciseId = 'test-exercise-123';
      const updateData = {
        title: 'Updated Exercise',
        duration: '20min',
      };

      mockDocUpdate.mockResolvedValue(undefined);

      await exerciseService.update(exerciseId, updateData);

      expect(mockDocUpdate).toHaveBeenCalledWith(expect.objectContaining(updateData));
    });
  });

  describe('delete', () => {
    it('should delete an exercise', async () => {
      const exerciseId = 'test-exercise-123';

      mockDocDelete.mockResolvedValue(undefined);

      await exerciseService.delete(exerciseId);

      expect(mockDocDelete).toHaveBeenCalled();
    });
  });

  describe('getAll', () => {
    it('should return all exercises', async () => {
      const mockExercises = [
        {
          id: 'exercise1',
          data: () => ({
            title: 'Exercise 1',
            chapterId: 'chapter1',
            courseId: 'course1',
            type: 'qcm',
            difficulty: 'facile',
            duration: '15min',
            questions: [],
          }),
        },
        {
          id: 'exercise2',
          data: () => ({
            title: 'Exercise 2',
            chapterId: 'chapter2',
            courseId: 'course2',
            type: 'code',
            difficulty: 'difficile',
            duration: '45min',
            questions: [],
          }),
        },
      ];

      mockCollectionGet.mockResolvedValue({
        docs: mockExercises,
      });

      const exercises = await exerciseService.getAll();

      expect(Array.isArray(exercises)).toBe(true);
      expect(exercises.length).toBe(2);
      expect(exercises[0].title).toBe('Exercise 1');
      expect(exercises[1].title).toBe('Exercise 2');
    });
  });
});
