import { ChapterService } from '../../services/chapter.service';

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

describe('ChapterService', () => {
  let chapterService: ChapterService;

  beforeEach(() => {
    chapterService = new ChapterService();
    jest.clearAllMocks();
    
    // Setup chainable where/orderBy
    mockWhere.mockReturnValue({
      orderBy: mockOrderBy,
      get: mockWhereGet,
    });
    mockOrderBy.mockReturnValue({
      get: mockWhereGet,
    });
  });

  describe('create', () => {
    it('should create a new chapter', async () => {
      const mockDocId = 'generated-chapter-id';
      const chapterData = {
        title: 'Test Chapter',
        description: 'A test chapter',
        courseId: 'test-course',
        order: 1,
        duration: '2h 0min',
        lessonsIds: [],
      };

      mockCollectionAdd.mockResolvedValue({ 
        id: mockDocId,
        update: jest.fn().mockResolvedValue(undefined),
      });

      const chapter = await chapterService.create(chapterData);

      expect(chapter).toBeDefined();
      expect(chapter.title).toBe(chapterData.title);
      expect(chapter.courseId).toBe(chapterData.courseId);
      expect(mockCollectionAdd).toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('should return a chapter by ID', async () => {
      const chapterId = 'test-chapter-123';
      const mockChapterData = {
        title: 'Test Chapter',
        description: 'A test chapter',
        courseId: 'test-course',
        order: 1,
        duration: '2h 0min',
        lessonsIds: [],
      };

      mockDocGet.mockResolvedValue({
        exists: true,
        id: chapterId,
        data: () => mockChapterData,
      });

      const chapter = await chapterService.getById(chapterId);

      expect(chapter).toBeDefined();
      expect(chapter?.id).toBe(chapterId);
      expect(chapter?.title).toBe('Test Chapter');
    });

    it('should return null for non-existent chapter', async () => {
      mockDocGet.mockResolvedValue({
        exists: false,
        id: 'nonexistent',
        data: () => undefined,
      });

      const chapter = await chapterService.getById('nonexistent-id');

      expect(chapter).toBeNull();
    });
  });

  describe('getByCourseId', () => {
    it('should return chapters for a course', async () => {
      const courseId = 'test-course';
      const mockChapters = [
        {
          id: 'chapter1',
          data: () => ({
            title: 'Chapter 1',
            description: 'Description 1',
            courseId: 'test-course',
            order: 1,
            duration: '1h 30min',
            lessonsIds: [],
          }),
        },
        {
          id: 'chapter2',
          data: () => ({
            title: 'Chapter 2',
            description: 'Description 2',
            courseId: 'test-course',
            order: 2,
            duration: '2h 0min',
            lessonsIds: [],
          }),
        },
      ];

      mockWhereGet.mockResolvedValue({
        docs: mockChapters,
      });

      const chapters = await chapterService.getByCourseId(courseId);

      expect(Array.isArray(chapters)).toBe(true);
      expect(chapters.length).toBe(2);
      expect(chapters[0].order).toBe(1);
      expect(chapters[1].order).toBe(2);
    });
  });

  describe('update', () => {
    it('should update a chapter', async () => {
      const chapterId = 'test-chapter-123';
      const updateData = {
        title: 'Updated Chapter',
        duration: '2h 30min',
      };

      mockDocUpdate.mockResolvedValue(undefined);

      await chapterService.update(chapterId, updateData);

      expect(mockDocUpdate).toHaveBeenCalledWith(expect.objectContaining(updateData));
    });
  });

  describe('delete', () => {
    it('should delete a chapter', async () => {
      const chapterId = 'test-chapter-123';

      mockDocDelete.mockResolvedValue(undefined);

      await chapterService.delete(chapterId);

      expect(mockDocDelete).toHaveBeenCalled();
    });
  });

  describe('getAll', () => {
    it('should return all chapters', async () => {
      const mockChapters = [
        {
          id: 'chapter1',
          data: () => ({
            title: 'Chapter 1',
            description: 'Description 1',
            courseId: 'course1',
            order: 1,
            duration: '1h 30min',
            lessonsIds: [],
          }),
        },
        {
          id: 'chapter2',
          data: () => ({
            title: 'Chapter 2',
            description: 'Description 2',
            courseId: 'course2',
            order: 1,
            duration: '2h 0min',
            lessonsIds: [],
          }),
        },
      ];

      mockCollectionGet.mockResolvedValue({
        docs: mockChapters,
      });

      const chapters = await chapterService.getAll();

      expect(Array.isArray(chapters)).toBe(true);
      expect(chapters.length).toBe(2);
      expect(chapters[0].title).toBe('Chapter 1');
      expect(chapters[1].title).toBe('Chapter 2');
    });
  });
});
