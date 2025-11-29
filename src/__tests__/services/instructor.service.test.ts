import { InstructorService } from '../../services/instructor.service';

// Mock Firestore
const mockDocGet = jest.fn();
const mockDocUpdate = jest.fn();
const mockDocDelete = jest.fn();
const mockCollectionGet = jest.fn();
const mockCollectionAdd = jest.fn();

jest.mock('../../config/firebase.config', () => ({
  db: {
    collection: jest.fn(() => ({
      add: mockCollectionAdd,
      doc: jest.fn(() => ({
        get: mockDocGet,
        update: mockDocUpdate,
        delete: mockDocDelete,
      })),
      get: mockCollectionGet,
    })),
  },
}));

describe('InstructorService', () => {
  let instructorService: InstructorService;

  beforeEach(() => {
    instructorService = new InstructorService();
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new instructor', async () => {
      const mockDocId = 'generated-instructor-id';
      const instructorData = {
        name: 'Test Instructor',
        bio: 'A test instructor',
        expertiseIds: ['algorithmie', 'web'],
        image: 'test.jpg',
      };

      mockCollectionAdd.mockResolvedValue({ 
        id: mockDocId,
        update: jest.fn().mockResolvedValue(undefined),
      });

      const instructor = await instructorService.create(instructorData);

      expect(instructor).toBeDefined();
      expect(instructor.name).toBe(instructorData.name);
      expect(instructor.bio).toBe(instructorData.bio);
      expect(mockCollectionAdd).toHaveBeenCalled();
    });

    it('should include expertise array', async () => {
      const mockDocId = 'generated-instructor-id';
      const instructorData = {
        name: 'Test Instructor',
        bio: 'A test instructor',
        expertiseIds: ['algorithmie', 'web'],
        image: 'test.jpg',
      };

      mockCollectionAdd.mockResolvedValue({ 
        id: mockDocId,
        update: jest.fn().mockResolvedValue(undefined),
      });

      const instructor = await instructorService.create(instructorData);

      expect(Array.isArray(instructor.expertiseIds)).toBe(true);
      expect(instructor.expertiseIds).toEqual(instructorData.expertiseIds);
    });
  });

  describe('getById', () => {
    it('should return an instructor by ID', async () => {
      const instructorId = 'test-instructor-123';
      const mockInstructorData = {
        name: 'Test Instructor',
        bio: 'A test bio',
        expertiseIds: ['algorithmie'],
        image: 'test.jpg',
      };

      mockDocGet.mockResolvedValue({
        exists: true,
        id: instructorId,
        data: () => mockInstructorData,
      });

      const instructor = await instructorService.getById(instructorId);

      expect(instructor).toBeDefined();
      expect(instructor?.id).toBe(instructorId);
      expect(instructor?.name).toBe('Test Instructor');
    });

    it('should return null for non-existent instructor', async () => {
      mockDocGet.mockResolvedValue({
        exists: false,
        id: 'nonexistent',
        data: () => undefined,
      });

      const instructor = await instructorService.getById('nonexistent-id');

      expect(instructor).toBeNull();
    });
  });

  describe('update', () => {
    it('should update an instructor', async () => {
      const instructorId = 'test-instructor-123';
      const updateData = {
        name: 'Updated Instructor',
        bio: 'Updated bio',
      };

      mockDocUpdate.mockResolvedValue(undefined);

      await instructorService.update(instructorId, updateData);

      expect(mockDocUpdate).toHaveBeenCalledWith(expect.objectContaining(updateData));
    });
  });

  describe('delete', () => {
    it('should delete an instructor', async () => {
      const instructorId = 'test-instructor-123';

      mockDocDelete.mockResolvedValue(undefined);

      await instructorService.delete(instructorId);

      expect(mockDocDelete).toHaveBeenCalled();
    });
  });

  describe('getAll', () => {
    it('should return all instructors', async () => {
      const mockInstructors = [
        {
          id: 'instructor1',
          data: () => ({
            name: 'Instructor 1',
            bio: 'Bio 1',
            expertiseIds: ['algorithmie'],
            image: 'test1.jpg',
          }),
        },
        {
          id: 'instructor2',
          data: () => ({
            name: 'Instructor 2',
            bio: 'Bio 2',
            expertiseIds: ['web'],
            image: 'test2.jpg',
          }),
        },
      ];

      mockCollectionGet.mockResolvedValue({
        docs: mockInstructors,
      });

      const instructors = await instructorService.getAll();

      expect(Array.isArray(instructors)).toBe(true);
      expect(instructors.length).toBe(2);
      expect(instructors[0].name).toBe('Instructor 1');
      expect(instructors[1].name).toBe('Instructor 2');
    });

    it('should include document IDs in all instructors', async () => {
      const mockInstructors = [
        {
          id: 'instructor1',
          data: () => ({
            name: 'Instructor 1',
            bio: 'Bio 1',
            expertiseIds: ['algorithmie'],
            image: 'test1.jpg',
          }),
        },
      ];

      mockCollectionGet.mockResolvedValue({
        docs: mockInstructors,
      });

      const instructors = await instructorService.getAll();

      instructors.forEach(instructor => {
        expect(instructor).toHaveProperty('id');
        expect(instructor.id).toBeTruthy();
      });
    });
  });
});
