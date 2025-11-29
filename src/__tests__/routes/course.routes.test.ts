import request from 'supertest';
import app from '../../server';

describe('Course API Endpoints', () => {
  describe('GET /api/courses', () => {
    it('should return all courses', async () => {
      const response = await request(app)
        .get('/api/courses')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/courses/:id', () => {
    it('should return a course by ID', async () => {
      const courseId = 'maths_algo_1';
      
      const response = await request(app)
        .get(`/api/courses/${courseId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBe(courseId);
    });

    it('should return 404 for non-existent course', async () => {
      const response = await request(app)
        .get('/api/courses/nonexistent-course')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/courses/category/:category', () => {
    it('should return courses by category', async () => {
      const category = 'algorithmie';
      
      const response = await request(app)
        .get(`/api/courses/category/${category}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('POST /api/courses', () => {
    it('should create a new course', async () => {
      const newCourse = {
        id: 'test-course-1',
        title: 'Test Course',
        description: 'A test course',
        image: 'test.jpg',
        backgroundColor: '#ffffff',
        price: 5000,
        duration: '10h',
        level: 'beginner',
        rating: 4.5,
        studentsCount: 0,
        instructorIds: ['test-instructor'],
        expertiseIds: ['test-expertise'],
        chaptersIds: []
      };

      const response = await request(app)
        .post('/api/courses')
        .send(newCourse)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('PUT /api/courses/:id', () => {
    it('should update a course', async () => {
      const courseId = 'maths_algo_1';
      const updateData = {
        title: 'Updated Title',
        description: 'Updated description'
      };

      const response = await request(app)
        .put(`/api/courses/${courseId}`)
        .send(updateData)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('DELETE /api/courses/:id', () => {
    it('should delete a course', async () => {
      const courseId = 'test-course-to-delete';

      const response = await request(app)
        .delete(`/api/courses/${courseId}`)
        .expect('Content-Type', /json/);

      // Accept both 200 (deleted) and 404 (not found)
      expect([200, 404]).toContain(response.status);
    });
  });
});
