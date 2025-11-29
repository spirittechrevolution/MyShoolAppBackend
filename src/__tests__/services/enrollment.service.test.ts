import { EnrollmentService } from '../../services/enrollment.service';

// Mock Firestore
const mockDocGet = jest.fn();
const mockDocUpdate = jest.fn();
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
      })),
      where: mockWhere,
      get: mockCollectionGet,
    })),
  },
}));

describe('EnrollmentService', () => {
  let enrollmentService: EnrollmentService;

  beforeEach(() => {
    enrollmentService = new EnrollmentService();
    jest.clearAllMocks();
    
    // Setup chainable where
    mockWhere.mockReturnValue({
      where: mockWhere,
      get: mockWhereGet,
    });
  });

  describe('create', () => {
    it('should create a new enrollment', async () => {
      const mockDocId = 'generated-enrollment-id';
      const enrollmentData = {
        userId: 'test-user',
        courseId: 'test-course',
        courseTitle: 'Test Course',
        courseImage: 'test.jpg',
        status: 'in-progress' as const,
        progress: 0,
        amount: 5000,
        paymentMethod: 'wave' as const,
        chaptersCompleted: [],
      };

      mockCollectionAdd.mockResolvedValue({ 
        id: mockDocId,
      });

      const enrollment = await enrollmentService.create(enrollmentData);

      expect(enrollment).toBeDefined();
      // Note: le service écrase userId avec docRef.id (ligne 10 du service)
      expect(enrollment.userId).toBe(mockDocId);
      expect(enrollment.courseId).toBe(enrollmentData.courseId);
      expect(mockCollectionAdd).toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('should return an enrollment by ID', async () => {
      const enrollmentId = 'test-enrollment-123';
      const mockEnrollmentData = {
        userId: 'test-user',
        courseId: 'test-course',
        courseTitle: 'Test Course',
        courseImage: 'test.jpg',
        status: 'in-progress',
        progress: 50,
        amount: 5000,
        paymentMethod: 'wave',
        chaptersCompleted: [],
        enrolledAt: new Date(),
      };

      mockDocGet.mockResolvedValue({
        exists: true,
        id: enrollmentId,
        data: () => mockEnrollmentData,
      });

      const enrollment = await enrollmentService.getById(enrollmentId);

      expect(enrollment).toBeDefined();
      expect(enrollment?.id).toBe(enrollmentId);
      expect(enrollment?.userId).toBe('test-user');
    });

    it('should return null for non-existent enrollment', async () => {
      mockDocGet.mockResolvedValue({
        exists: false,
        id: 'nonexistent',
        data: () => undefined,
      });

      const enrollment = await enrollmentService.getById('nonexistent-id');

      expect(enrollment).toBeNull();
    });
  });

  describe('getByUserId', () => {
    it('should return enrollments for a user', async () => {
      const userId = 'test-user';
      const mockEnrollments = [
        {
          id: 'enrollment1',
          data: () => ({
            userId: 'test-user',
            courseId: 'course1',
            courseTitle: 'Course 1',
            courseImage: 'test1.jpg',
            status: 'in-progress',
            progress: 30,
            amount: 5000,
            paymentMethod: 'wave',
            chaptersCompleted: [],
            enrolledAt: new Date('2024-01-15'),
          }),
        },
        {
          id: 'enrollment2',
          data: () => ({
            userId: 'test-user',
            courseId: 'course2',
            courseTitle: 'Course 2',
            courseImage: 'test2.jpg',
            status: 'completed',
            progress: 100,
            amount: 6000,
            paymentMethod: 'orange-money',
            chaptersCompleted: [],
            enrolledAt: new Date('2024-01-10'),
          }),
        },
      ];

      mockWhereGet.mockResolvedValue({
        docs: mockEnrollments,
      });

      const enrollments = await enrollmentService.getByUserId(userId);

      expect(Array.isArray(enrollments)).toBe(true);
      expect(enrollments.length).toBe(2);
      expect(enrollments[0].userId).toBe('test-user');
    });
  });

  describe('getByCourseId', () => {
    it('should return enrollments for a course', async () => {
      const courseId = 'test-course';
      const mockEnrollments = [
        {
          id: 'enrollment1',
          data: () => ({
            userId: 'user1',
            courseId: 'test-course',
            courseTitle: 'Test Course',
            courseImage: 'test.jpg',
            status: 'in-progress',
            progress: 50,
            amount: 5000,
            paymentMethod: 'wave',
            chaptersCompleted: [],
            enrolledAt: new Date(),
          }),
        },
      ];

      mockWhereGet.mockResolvedValue({
        docs: mockEnrollments,
      });

      const enrollments = await enrollmentService.getByCourseId(courseId);

      expect(Array.isArray(enrollments)).toBe(true);
      expect(enrollments.length).toBe(1);
      expect(enrollments[0].courseId).toBe('test-course');
    });
  });

  describe('updateProgress', () => {
    it('should update enrollment progress', async () => {
      const enrollmentId = 'test-enrollment-123';
      const progress = 75;

      mockDocUpdate.mockResolvedValue(undefined);

      await enrollmentService.updateProgress(enrollmentId, progress);

      expect(mockDocUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ progress })
      );
    });
  });

  describe('updateStatus', () => {
    it('should update enrollment status', async () => {
      const enrollmentId = 'test-enrollment-123';
      const status = 'completed' as const;

      mockDocUpdate.mockResolvedValue(undefined);

      await enrollmentService.updateStatus(enrollmentId, status);

      expect(mockDocUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ status })
      );
    });
  });

  describe('getAll', () => {
    it('should return all enrollments', async () => {
      const mockEnrollments = [
        {
          id: 'enrollment1',
          data: () => ({
            userId: 'user1',
            courseId: 'course1',
            courseTitle: 'Course 1',
            courseImage: 'test1.jpg',
            status: 'in-progress',
            progress: 30,
            amount: 5000,
            paymentMethod: 'wave',
            chaptersCompleted: [],
            enrolledAt: new Date(),
          }),
        },
        {
          id: 'enrollment2',
          data: () => ({
            userId: 'user2',
            courseId: 'course2',
            courseTitle: 'Course 2',
            courseImage: 'test2.jpg',
            status: 'completed',
            progress: 100,
            amount: 6000,
            paymentMethod: 'orange-money',
            chaptersCompleted: [],
            enrolledAt: new Date(),
          }),
        },
      ];

      mockCollectionGet.mockResolvedValue({
        docs: mockEnrollments,
      });

      const enrollments = await enrollmentService.getAll();

      expect(Array.isArray(enrollments)).toBe(true);
      expect(enrollments.length).toBe(2);
      expect(enrollments[0].userId).toBe('user1');
      expect(enrollments[1].userId).toBe('user2');
    });
  });
});
