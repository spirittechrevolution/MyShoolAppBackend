import request from 'supertest';
import app from '../../server';

describe('Instructor API Endpoints', () => {
  describe('GET /api/instructors', () => {
    it('should return all instructors', async () => {
      const response = await request(app)
        .get('/api/instructors')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.count).toBeDefined();
    });

    it('should return instructors with correct structure', async () => {
      const response = await request(app)
        .get('/api/instructors')
        .expect(200);

      const instructors = response.body.data;
      expect(instructors.length).toBeGreaterThan(0);

      instructors.forEach((instructor: any) => {
        expect(instructor).toHaveProperty('id');
        expect(instructor).toHaveProperty('name');
        expect(instructor).toHaveProperty('title');
        expect(instructor).toHaveProperty('bio');
        expect(instructor).toHaveProperty('rating');
        expect(instructor).toHaveProperty('coursesIds');
        expect(instructor).toHaveProperty('expertiseIds');
      });
    });
  });

  describe('GET /api/instructors/:id', () => {
    it('should return an instructor by ID', async () => {
      const instructorId = 'diop';
      
      const response = await request(app)
        .get(`/api/instructors/${instructorId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBe(instructorId);
    });

    it('should return 404 for non-existent instructor', async () => {
      const response = await request(app)
        .get('/api/instructors/nonexistent-instructor')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBeDefined();
    });
  });

  describe('POST /api/instructors', () => {
    it('should create a new instructor', async () => {
      const newInstructor = {
        id: 'test-instructor',
        name: 'TEST',
        title: 'Test Instructor',
        bio: 'Test bio',
        image: 'test.jpg',
        backgroundColor: '#000000',
        rating: 5.0,
        coursesIds: [],
        expertiseIds: []
      };

      const response = await request(app)
        .post('/api/instructors')
        .send(newInstructor)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.name).toBe(newInstructor.name);
    });

    it('should handle partial instructor data', async () => {
      const partialInstructor = {
        name: 'Test Instructor'
        // API uses default values for missing fields
      };

      const response = await request(app)
        .post('/api/instructors')
        .send(partialInstructor)
        .expect('Content-Type', /json/);

      // API accepts partial data and uses defaults
      expect([200, 201]).toContain(response.status);
    });
  });

  describe('PUT /api/instructors/:id', () => {
    it('should update an instructor', async () => {
      const instructorId = 'diop';
      const updateData = {
        title: 'Updated Title',
        bio: 'Updated bio'
      };

      const response = await request(app)
        .put(`/api/instructors/${instructorId}`)
        .send(updateData)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('DELETE /api/instructors/:id', () => {
    it('should delete an instructor', async () => {
      // Créer d'abord un instructeur de test
      const newInstructor = {
        id: 'to-delete-instructor',
        name: 'TO DELETE',
        title: 'Test',
        bio: 'Test',
        image: 'test.jpg',
        backgroundColor: '#000000',
        rating: 5.0,
        coursesIds: [],
        expertiseIds: []
      };

      await request(app)
        .post('/api/instructors')
        .send(newInstructor);

      const response = await request(app)
        .delete(`/api/instructors/${newInstructor.id}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});
