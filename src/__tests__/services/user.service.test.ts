import { UserService } from '../../services/user.service';
import { UserModel } from '../../models';

// Mock Firebase Admin
const mockCreateUser = jest.fn();
const mockGetUser = jest.fn();
const mockUpdateUser = jest.fn();
const mockDeleteUser = jest.fn();

const mockDocGet = jest.fn();
const mockDocSet = jest.fn();
const mockDocUpdate = jest.fn();
const mockDocDelete = jest.fn();
const mockCollectionGet = jest.fn();
const mockCollectionAdd = jest.fn();
const mockWhereGet = jest.fn();
const mockLimit = jest.fn();

jest.mock('../../config/firebase.config', () => ({
  db: {
    collection: jest.fn(() => ({
      add: mockCollectionAdd,
      doc: jest.fn(() => ({
        get: mockDocGet,
        set: mockDocSet,
        update: mockDocUpdate,
        delete: mockDocDelete,
      })),
      where: jest.fn(() => ({
        limit: mockLimit,
        get: mockWhereGet,
      })),
      get: mockCollectionGet,
    })),
  },
  auth: {
    createUser: mockCreateUser,
    getUser: mockGetUser,
    updateUser: mockUpdateUser,
    deleteUser: mockDeleteUser,
  },
}));

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
    jest.clearAllMocks();
    
    // Setup default mocks
    mockLimit.mockReturnValue({ get: mockWhereGet });
  });

  describe('create', () => {
    it('should create a new user without authentication', async () => {
      const mockDocId = 'generated-doc-id';
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        phone: '221777777777',
        level: 'beginner' as const,
        role: { libelle: 'student' as const },
        status: 'active' as const,
      };

      // Mock pour générer un ID sans auth (pas de login/password)
      mockCollectionAdd.mockResolvedValue({ id: mockDocId, delete: jest.fn() });
      mockDocSet.mockResolvedValue(undefined);

      const user = await userService.create(userData);

      expect(user).toBeDefined();
      expect(user.firstName).toBe(userData.firstName);
      expect(user.lastName).toBe(userData.lastName);
      expect(user.phone).toBe(userData.phone);
    });
  });

  describe('getById', () => {
    it('should return a user by ID', async () => {
      const mockUid = 'test-uid-123';
      const mockUserData = {
        firstName: 'Test',
        lastName: 'User',
        phone: '221111111111',
        level: 'beginner',
        role: { libelle: 'student' },
        status: 'active',
      };

      mockDocGet.mockResolvedValue({
        exists: true,
        id: mockUid,
        data: () => mockUserData,
      });

      const user = await userService.getById(mockUid);

      expect(user).toBeDefined();
      expect(user?.uid).toBe(mockUid);
      expect(user?.firstName).toBe('Test');
    });

    it('should return null for non-existent user', async () => {
      mockDocGet.mockResolvedValue({
        exists: false,
        id: 'nonexistent',
        data: () => undefined,
      });

      const user = await userService.getById('nonexistent-id');

      expect(user).toBeNull();
    });
  });

  describe('getByPhone', () => {
    it('should return a user by phone number', async () => {
      const mockUserData = {
        firstName: 'Phone',
        lastName: 'Test',
        phone: '221222222222',
        level: 'beginner',
        role: { libelle: 'student' },
        status: 'active',
      };

      mockWhereGet.mockResolvedValue({
        empty: false,
        docs: [{
          id: 'test-uid',
          data: () => mockUserData,
        }],
      });

      const user = await userService.getByPhone('221222222222');

      expect(user).toBeDefined();
      expect(user?.phone).toBe('221222222222');
    });

    it('should return null for non-existent phone', async () => {
      mockWhereGet.mockResolvedValue({
        empty: true,
        docs: [],
      });

      const user = await userService.getByPhone('999999999');

      expect(user).toBeNull();
    });
  });

  describe('update', () => {
    it('should update user data', async () => {
      const mockUid = 'test-uid-123';
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
      };

      mockDocUpdate.mockResolvedValue(undefined);

      await userService.update(mockUid, updateData);

      expect(mockDocUpdate).toHaveBeenCalledWith(expect.objectContaining(updateData));
    });
  });

  describe('delete', () => {
    it('should delete a user from Firestore', async () => {
      const mockUid = 'test-uid-123';

      mockDocDelete.mockResolvedValue(undefined);
      mockDeleteUser.mockRejectedValue(new Error('User not found in Auth'));

      await userService.delete(mockUid);

      expect(mockDocDelete).toHaveBeenCalled();
      // Auth delete peut échouer si l'utilisateur n'existe pas dans Auth, c'est normal
    });
  });

  describe('getAll', () => {
    it('should return all users', async () => {
      const mockUsers = [
        {
          id: 'uid1',
          data: () => ({
            firstName: 'User1',
            lastName: 'Test',
            phone: '221111111111',
            level: 'beginner',
            role: { libelle: 'student' },
            status: 'active',
          }),
        },
        {
          id: 'uid2',
          data: () => ({
            firstName: 'User2',
            lastName: 'Test',
            phone: '221222222222',
            level: 'intermediate',
            role: { libelle: 'student' },
            status: 'active',
          }),
        },
      ];

      mockCollectionGet.mockResolvedValue({
        docs: mockUsers,
      });

      const users = await userService.getAll();

      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBe(2);
      expect(users[0].firstName).toBe('User1');
      expect(users[1].firstName).toBe('User2');
    });
  });
});
