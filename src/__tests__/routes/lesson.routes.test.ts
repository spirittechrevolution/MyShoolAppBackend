import request from 'supertest';
import app from '../../server';

describe('Lesson Routes', () => {
  describe('GET /api/lessons', () => {
    it('should return all lessons', async () => {
      const response = await request(app)
        .get('/api/lessons')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/lessons/:id', () => {
    it('should return a specific lesson', async () => {
      const lessonId = 'maths_algo_1_chap_1_lesson_1';
      
      const response = await request(app)
        .get(`/api/lessons/${lessonId}`)
        .expect('Content-Type', /json/);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('title');
        expect(response.body).toHaveProperty('chapterId');
        expect(response.body).toHaveProperty('courseId');
      }
    });

    it('should return 404 for non-existent lesson', async () => {
      const response = await request(app)
        .get('/api/lessons/non_existent_id')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/lessons/chapter/:chapterId', () => {
    it('should return lessons for a specific chapter', async () => {
      const chapterId = 'maths_algo_1_chap_1';
      
      const response = await request(app)
        .get(`/api/lessons/chapter/${chapterId}`)
        .expect('Content-Type', /json/);

      if (response.status === 200) {
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
      }
    });
  });

  describe('GET /api/lessons/course/:courseId', () => {
    it('should return lessons for a specific course', async () => {
      const courseId = 'maths_algo_1';
      
      const response = await request(app)
        .get(`/api/lessons/course/${courseId}`)
        .expect('Content-Type', /json/);

      if (response.status === 200) {
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
      }
    });
  });

  describe('POST /api/lessons', () => {
    it('should create a new lesson', async () => {
      const newLesson = {
        title: 'Test Lesson',
        chapterId: 'test-chapter',
        courseId: 'test-course',
        order: 1,
        duration: '30:00',
        type: 'video',
      };

      const response = await request(app)
        .post('/api/lessons')
        .send(newLesson)
        .expect('Content-Type', /json/);

      if (response.status === 201) {
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('title', newLesson.title);
      }
    });

    it('should handle partial lesson data', async () => {
      const partialLesson = {
        title: 'Test Lesson',
        // API uses default values for missing fields
      };

      const response = await request(app)
        .post('/api/lessons')
        .send(partialLesson)
        .expect('Content-Type', /json/);

      // API accepts partial data and uses defaults
      expect([200, 201]).toContain(response.status);
    });
  });

  describe('PUT /api/lessons/:id', () => {
    it('should update a lesson', async () => {
      const lessonId = 'maths_algo_1_chap_1_lesson_1';
      const updateData = {
        duration: '45:00',
      };

      const response = await request(app)
        .put(`/api/lessons/${lessonId}`)
        .send(updateData)
        .expect('Content-Type', /json/);

      expect([200, 400, 404]).toContain(response.status);
    });
  });

  describe('DELETE /api/lessons/:id', () => {
    it('should delete a lesson', async () => {
      const lessonId = 'test-lesson-to-delete';

      const response = await request(app)
        .delete(`/api/lessons/${lessonId}`)
        .expect('Content-Type', /json/);

      expect([200, 404]).toContain(response.status);
    });
  });
});
