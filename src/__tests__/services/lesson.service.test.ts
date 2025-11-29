import { LessonService } from '../../services/lesson.service';

// Mock Firestore
const mockDocGet = jest.fn();
const mockDocUpdate = jest.fn();
const mockDocDelete = jest.fn();
const mockCollectionGet = jest.fn();
const mockCollectionAdd = jest.fn();
const mockWhereGet = jest.fn();
const mockWhere = jest.fn();
const mockOrderBy = jest.fn();

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
      orderBy: mockOrderBy,
      get: mockCollectionGet,
    })),
  },
}));

describe('LessonService', () => {
  let lessonService: LessonService;

  beforeEach(() => {
    lessonService = new LessonService();
    jest.clearAllMocks();
    
    // Setup chainable where/orderBy
    mockWhere.mockReturnValue({
      where: mockWhere,
      orderBy: mockOrderBy,
      get: mockWhereGet,
    });
    mockOrderBy.mockReturnValue({
      get: mockWhereGet,
    });
  });

  describe('create', () => {
    it('should create a new lesson', async () => {
      const mockDocId = 'generated-lesson-id';
      const lessonData = {
        title: 'Test Lesson',
        chapterId: 'test-chapter',
        courseId: 'test-course',
        order: 1,
        duration: '30:00',
        type: 'video' as const,
      };

      mockCollectionAdd.mockResolvedValue({ 
        id: mockDocId,
        update: jest.fn().mockResolvedValue(undefined),
      });

      const lesson = await lessonService.create(lessonData);

      expect(lesson).toBeDefined();
      expect(lesson.title).toBe(lessonData.title);
      expect(lesson.chapterId).toBe(lessonData.chapterId);
      expect(mockCollectionAdd).toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('should return a lesson by ID', async () => {
      const lessonId = 'test-lesson-123';
      const mockLessonData = {
        title: 'Test Lesson',
        chapterId: 'test-chapter',
        courseId: 'test-course',
        order: 1,
        duration: '30:00',
        type: 'video',
      };

      mockDocGet.mockResolvedValue({
        exists: true,
        id: lessonId,
        data: () => mockLessonData,
      });

      const lesson = await lessonService.getById(lessonId);

      expect(lesson).toBeDefined();
      expect(lesson?.id).toBe(lessonId);
      expect(lesson?.title).toBe('Test Lesson');
    });

    it('should return null for non-existent lesson', async () => {
      mockDocGet.mockResolvedValue({
        exists: false,
        id: 'nonexistent',
        data: () => undefined,
      });

      const lesson = await lessonService.getById('nonexistent-id');

      expect(lesson).toBeNull();
    });
  });

  describe('getByChapterId', () => {
    it('should return lessons for a chapter', async () => {
      const chapterId = 'test-chapter';
      const mockLessons = [
        {
          id: 'lesson1',
          data: () => ({
            title: 'Lesson 1',
            chapterId: 'test-chapter',
            courseId: 'test-course',
            order: 1,
            duration: '30:00',
            type: 'video',
          }),
        },
        {
          id: 'lesson2',
          data: () => ({
            title: 'Lesson 2',
            chapterId: 'test-chapter',
            courseId: 'test-course',
            order: 2,
            duration: '45:00',
            type: 'video',
          }),
        },
      ];

      mockWhereGet.mockResolvedValue({
        docs: mockLessons,
      });

      const lessons = await lessonService.getByChapterId(chapterId);

      expect(Array.isArray(lessons)).toBe(true);
      expect(lessons.length).toBe(2);
      expect(lessons[0].order).toBe(1);
      expect(lessons[1].order).toBe(2);
    });
  });

  describe('getByCourseId', () => {
    it('should return lessons for a course', async () => {
      const courseId = 'test-course';
      const mockLessons = [
        {
          id: 'lesson1',
          data: () => ({
            title: 'Lesson 1',
            chapterId: 'chapter1',
            courseId: 'test-course',
            order: 1,
            duration: '30:00',
            type: 'video',
          }),
        },
      ];

      mockWhereGet.mockResolvedValue({
        docs: mockLessons,
      });

      const lessons = await lessonService.getByCourseId(courseId);

      expect(Array.isArray(lessons)).toBe(true);
      expect(lessons.length).toBe(1);
    });
  });

  describe('update', () => {
    it('should update a lesson', async () => {
      const lessonId = 'test-lesson-123';
      const updateData = {
        title: 'Updated Lesson',
        duration: '45:00',
      };

      mockDocUpdate.mockResolvedValue(undefined);

      await lessonService.update(lessonId, updateData);

      expect(mockDocUpdate).toHaveBeenCalledWith(expect.objectContaining(updateData));
    });
  });

  describe('delete', () => {
    it('should delete a lesson', async () => {
      const lessonId = 'test-lesson-123';

      mockDocDelete.mockResolvedValue(undefined);

      await lessonService.delete(lessonId);

      expect(mockDocDelete).toHaveBeenCalled();
    });
  });

  describe('getAll', () => {
    it('should return all lessons', async () => {
      const mockLessons = [
        {
          id: 'lesson1',
          data: () => ({
            title: 'Lesson 1',
            chapterId: 'chapter1',
            courseId: 'course1',
            order: 1,
            duration: '30:00',
            type: 'video',
          }),
        },
        {
          id: 'lesson2',
          data: () => ({
            title: 'Lesson 2',
            chapterId: 'chapter2',
            courseId: 'course2',
            order: 1,
            duration: '45:00',
            type: 'article',
          }),
        },
      ];

      mockCollectionGet.mockResolvedValue({
        docs: mockLessons,
      });

      const lessons = await lessonService.getAll();

      expect(Array.isArray(lessons)).toBe(true);
      expect(lessons.length).toBe(2);
      expect(lessons[0].title).toBe('Lesson 1');
      expect(lessons[1].title).toBe('Lesson 2');
    });
  });
});
