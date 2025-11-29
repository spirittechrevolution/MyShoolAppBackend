import request from 'supertest';
import app from '../../server';

describe('Enrollment API Endpoints', () => {
  describe('GET /api/enrollments', () => {
    it('should return all enrollments', async () => {
      const response = await request(app)
        .get('/api/enrollments')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.count).toBeDefined();
    });
  });

  describe('GET /api/enrollments/user/:userId', () => {
    it('should return enrollments for a specific user', async () => {
      const userId = 'lnVEpSL2OdPAPmOGfQAKbvWj1cB2';
      
      const response = await request(app)
        .get(`/api/enrollments/user/${userId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      
      // Vérifier que tous les enrollments appartiennent à l'utilisateur
      response.body.data.forEach((enrollment: any) => {
        expect(enrollment.userId).toBe(userId);
        expect(enrollment.id).toBeDefined();
      });
    });

    it('should return empty array for user with no enrollments', async () => {
      const response = await request(app)
        .get('/api/enrollments/user/nonexistent-user-id')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
      expect(response.body.count).toBe(0);
    });
  });

  describe('GET /api/enrollments/:id', () => {
    it('should return an enrollment by ID', async () => {
      const enrollmentId = '01WIxWoq2Gp1GOP6xqJG';
      
      const response = await request(app)
        .get(`/api/enrollments/${enrollmentId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBe(enrollmentId);
    });

    it('should return 404 for non-existent enrollment', async () => {
      const response = await request(app)
        .get('/api/enrollments/nonexistent-id')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/enrollments/course/:courseId', () => {
    it('should return enrollments for a specific course', async () => {
      const courseId = 'maths_algo_1';
      
      const response = await request(app)
        .get(`/api/enrollments/course/${courseId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      
      response.body.data.forEach((enrollment: any) => {
        expect(enrollment.courseId).toBe(courseId);
      });
    });
  });

  describe('POST /api/enrollments', () => {
    it('should create a new enrollment', async () => {
      const newEnrollment = {
        userId: 'test-user-id',
        courseId: 'test-course-id',
        courseTitle: 'Test Course',
        courseImage: 'test.jpg',
        status: 'in-progress',
        progress: 0,
        amount: 5000,
        paymentMethod: 'wave',
        chaptersCompleted: []
      };

      const response = await request(app)
        .post('/api/enrollments')
        .send(newEnrollment)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('PATCH /api/enrollments/:id/progress', () => {
    it('should update enrollment progress', async () => {
      const enrollmentId = '01WIxWoq2Gp1GOP6xqJG';
      const progressData = { progress: 50 };

      const response = await request(app)
        .patch(`/api/enrollments/${enrollmentId}/progress`)
        .send(progressData)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('PATCH /api/enrollments/:id/status', () => {
    it('should update enrollment status', async () => {
      const enrollmentId = '01WIxWoq2Gp1GOP6xqJG';
      const statusData = { status: 'completed' };

      const response = await request(app)
        .patch(`/api/enrollments/${enrollmentId}/status`)
        .send(statusData)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});
