import { CourseService } from '../../services/course.service';

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

describe('CourseService', () => {
  let courseService: CourseService;

  beforeEach(() => {
    courseService = new CourseService();
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
    it('should create a new course', async () => {
      const mockDocId = 'generated-course-id';
      const courseData = {
        title: 'Test Course',
        description: 'A test course',
        image: 'test.jpg',
        category: 'algorithmie',
        price: 5000,
        isFree: false,
        chaptersIds: [],
        chapters: [],
      };

      mockCollectionAdd.mockResolvedValue({ 
        id: mockDocId,
        update: jest.fn().mockResolvedValue(undefined),
      });

      const course = await courseService.create(courseData);

      expect(course).toBeDefined();
      expect(course.title).toBe(courseData.title);
      expect(course.category).toBe(courseData.category);
      expect(mockCollectionAdd).toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('should return a course by ID', async () => {
      const courseId = 'test-course-123';
      const mockCourseData = {
        title: 'Test Course',
        description: 'A test course',
        image: 'test.jpg',
        category: 'algorithmie',
        price: 5000,
        isFree: false,
        chaptersIds: [],
        chapters: [],
      };

      mockDocGet.mockResolvedValue({
        exists: true,
        id: courseId,
        data: () => mockCourseData,
      });

      const course = await courseService.getById(courseId);

      expect(course).toBeDefined();
      expect(course?.id).toBe(courseId);
      expect(course?.title).toBe('Test Course');
    });

    it('should return null for non-existent course', async () => {
      mockDocGet.mockResolvedValue({
        exists: false,
        id: 'nonexistent',
        data: () => undefined,
      });

      const course = await courseService.getById('nonexistent-id');

      expect(course).toBeNull();
    });
  });

  describe('getByCategory', () => {
    it('should return courses by category', async () => {
      const category = 'algorithmie';
      const mockCourses = [
        {
          id: 'course1',
          data: () => ({
            title: 'Course 1',
            description: 'Description 1',
            category: 'algorithmie',
            price: 5000,
            isFree: false,
            chaptersIds: [],
            chapters: [],
          }),
        },
        {
          id: 'course2',
          data: () => ({
            title: 'Course 2',
            description: 'Description 2',
            category: 'algorithmie',
            price: 6000,
            isFree: false,
            chaptersIds: [],
            chapters: [],
          }),
        },
      ];

      mockWhereGet.mockResolvedValue({
        docs: mockCourses,
      });

      const courses = await courseService.getByCategory(category);

      expect(Array.isArray(courses)).toBe(true);
      expect(courses.length).toBe(2);
      courses.forEach(course => {
        expect(course.category).toBe(category);
      });
    });
  });

  describe('update', () => {
    it('should update a course', async () => {
      const courseId = 'test-course-123';
      const updateData = {
        title: 'Updated Course',
        price: 6000,
      };

      mockDocUpdate.mockResolvedValue(undefined);

      await courseService.update(courseId, updateData);

      expect(mockDocUpdate).toHaveBeenCalledWith(expect.objectContaining(updateData));
    });
  });

  describe('delete', () => {
    it('should delete a course', async () => {
      const courseId = 'test-course-123';

      mockDocDelete.mockResolvedValue(undefined);

      await courseService.delete(courseId);

      expect(mockDocDelete).toHaveBeenCalled();
    });
  });

  describe('getAll', () => {
    it('should return all courses', async () => {
      const mockCourses = [
        {
          id: 'course1',
          data: () => ({
            title: 'Course 1',
            description: 'Description 1',
            category: 'algorithmie',
            price: 5000,
            isFree: false,
            chaptersIds: [],
            chapters: [],
          }),
        },
        {
          id: 'course2',
          data: () => ({
            title: 'Course 2',
            description: 'Description 2',
            category: 'web',
            price: 6000,
            isFree: true,
            chaptersIds: [],
            chapters: [],
          }),
        },
      ];

      mockCollectionGet.mockResolvedValue({
        docs: mockCourses,
      });

      const courses = await courseService.getAll();

      expect(Array.isArray(courses)).toBe(true);
      expect(courses.length).toBe(2);
      expect(courses[0].title).toBe('Course 1');
      expect(courses[1].title).toBe('Course 2');
    });
  });
});
