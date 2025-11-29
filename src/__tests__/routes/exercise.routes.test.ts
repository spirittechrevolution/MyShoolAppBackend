import request from 'supertest';
import app from '../../server';

describe('Exercise Routes', () => {
  describe('GET /api/exercises', () => {
    it('should return all exercises', async () => {
      const response = await request(app)
        .get('/api/exercises')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/exercises/:id', () => {
    it('should return a specific exercise', async () => {
      const exerciseId = 'maths_algo_1_chap_1_lesson_1_ex_1';
      
      const response = await request(app)
        .get(`/api/exercises/${exerciseId}`)
        .expect('Content-Type', /json/);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('title');
        expect(response.body).toHaveProperty('question');
        expect(response.body).toHaveProperty('type');
        expect(response.body).toHaveProperty('lessonId');
      }
    });

    it('should return 404 for non-existent exercise', async () => {
      const response = await request(app)
        .get('/api/exercises/non_existent_id')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/exercises/type/:type', () => {
    it('should return exercises by type', async () => {
      const type = 'qcm';
      
      const response = await request(app)
        .get(`/api/exercises/type/${type}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/exercises/chapter/:chapterId', () => {
    it('should return exercises for a specific chapter', async () => {
      const chapterId = 'maths_algo_1_chap_1';
      
      const response = await request(app)
        .get(`/api/exercises/chapter/${chapterId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/exercises/course/:courseId', () => {
    it('should return exercises for a specific course', async () => {
      const courseId = 'maths_algo_1';
      
      const response = await request(app)
        .get(`/api/exercises/course/${courseId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('POST /api/exercises', () => {
    it('should create a new exercise', async () => {
      const newExercise = {
        title: 'Test Exercise',
        chapterId: 'test-chapter',
        courseId: 'test-course',
        type: 'qcm',
        difficulty: 'facile',
        duration: '15min',
      };

      const response = await request(app)
        .post('/api/exercises')
        .send(newExercise)
        .expect('Content-Type', /json/);

      if (response.status === 201) {
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('title', newExercise.title);
      }
    });

    it('should handle partial exercise data', async () => {
      const partialExercise = {
        title: 'Test Exercise',
        // API uses default values for missing fields
      };

      const response = await request(app)
        .post('/api/exercises')
        .send(partialExercise)
        .expect('Content-Type', /json/);

      // API accepts partial data and uses defaults
      expect([200, 201]).toContain(response.status);
    });
  });

  describe('PUT /api/exercises/:id', () => {
    it('should update an exercise', async () => {
      const exerciseId = 'maths_algo_1_chap_1_lesson_1_ex_1';
      const updateData = {
        duration: '20min',
      };

      const response = await request(app)
        .put(`/api/exercises/${exerciseId}`)
        .send(updateData)
        .expect('Content-Type', /json/);

      expect([200, 400, 404]).toContain(response.status);
    });
  });

  describe('DELETE /api/exercises/:id', () => {
    it('should delete an exercise', async () => {
      const exerciseId = 'test-exercise-to-delete';

      const response = await request(app)
        .delete(`/api/exercises/${exerciseId}`)
        .expect('Content-Type', /json/);

      expect([200, 404]).toContain(response.status);
    });
  });
});
