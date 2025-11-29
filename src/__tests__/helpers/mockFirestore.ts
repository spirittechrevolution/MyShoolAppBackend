// Mock helper for Firestore and Firebase Auth
interface MockDocument {
  id: string;
  data: any;
}

class MockFirestoreCollection {
  private documents: Map<string, MockDocument> = new Map();

  add(data: any): Promise<{ id: string }> {
    const id = Math.random().toString(36).substring(7);
    this.documents.set(id, { id, data });
    return Promise.resolve({ id });
  }

  doc(id: string) {
    const self = this;
    return {
      get(): Promise<{ exists: boolean; id: string; data: () => any }> {
        const doc = self.documents.get(id);
        if (doc) {
          return Promise.resolve({
            exists: true,
            id: doc.id,
            data: () => doc.data,
          });
        }
        return Promise.resolve({
          exists: false,
          id,
          data: () => undefined,
        });
      },
      set(data: any): Promise<void> {
        self.documents.set(id, { id, data });
        return Promise.resolve();
      },
      update(data: any): Promise<void> {
        const existing = self.documents.get(id);
        if (existing) {
          self.documents.set(id, { id, data: { ...existing.data, ...data } });
        }
        return Promise.resolve();
      },
      delete(): Promise<void> {
        self.documents.delete(id);
        return Promise.resolve();
      },
    };
  }

  where(field: string, operator: string, value: any) {
    const self = this;
    return {
      limit(n: number) {
        return {
          get(): Promise<{ empty: boolean; docs: any[] }> {
            const docs = Array.from(self.documents.values())
              .filter((doc) => doc.data[field] === value)
              .slice(0, n)
              .map((doc) => ({
                id: doc.id,
                data: () => doc.data,
              }));
            return Promise.resolve({ empty: docs.length === 0, docs });
          },
        };
      },
      get(): Promise<{ empty: boolean; docs: any[] }> {
        const docs = Array.from(self.documents.values())
          .filter((doc) => doc.data[field] === value)
          .map((doc) => ({
            id: doc.id,
            data: () => doc.data,
          }));
        return Promise.resolve({ empty: docs.length === 0, docs });
      },
    };
  }

  get(): Promise<{ docs: any[] }> {
    const docs = Array.from(this.documents.values()).map((doc) => ({
      id: doc.id,
      data: () => doc.data,
    }));
    return Promise.resolve({ docs });
  }
}

class MockFirestore {
  private collections: Map<string, MockFirestoreCollection> = new Map();

  collection(name: string): MockFirestoreCollection {
    if (!this.collections.has(name)) {
      this.collections.set(name, new MockFirestoreCollection());
    }
    return this.collections.get(name)!;
  }
}

class MockAuth {
  private users: Map<string, any> = new Map();

  createUser(data: any): Promise<{ uid: string }> {
    const uid = Math.random().toString(36).substring(7);
    this.users.set(uid, data);
    return Promise.resolve({ uid });
  }

  getUser(uid: string): Promise<any> {
    const user = this.users.get(uid);
    if (user) {
      return Promise.resolve({ uid, ...user });
    }
    throw new Error('User not found');
  }

  updateUser(uid: string, data: any): Promise<void> {
    if (this.users.has(uid)) {
      const existing = this.users.get(uid);
      this.users.set(uid, { ...existing, ...data });
      return Promise.resolve();
    }
    throw new Error('User not found');
  }

  deleteUser(uid: string): Promise<void> {
    this.users.delete(uid);
    return Promise.resolve();
  }
}

export const mockDb = new MockFirestore();
export const mockAuth = new MockAuth();

export const createMockFirestore = () => {
  return { db: mockDb, auth: mockAuth };
};
