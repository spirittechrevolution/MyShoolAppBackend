// Mock helper for Firestore
export const createMockFirestore = () => {
  const mockDocData = {};
  const mockDocs: any[] = [];

  return {
    collection: jest.fn(() => ({
      add: jest.fn().mockResolvedValue({
        id: 'mock-doc-id',
        update: jest.fn().mockResolvedValue(undefined),
      }),
      doc: jest.fn(() => ({
        get: jest.fn().mockResolvedValue({
          exists: true,
          id: 'mock-doc-id',
          data: () => mockDocData,
        }),
        update: jest.fn().mockResolvedValue(undefined),
        delete: jest.fn().mockResolvedValue(undefined),
      })),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        docs: mockDocs,
        empty: mockDocs.length === 0,
      }),
    })),
  };
};
