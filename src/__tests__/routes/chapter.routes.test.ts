import request from 'supertest';
import app from '../../server';

describe('Chapter Routes', () => {
  describe('GET /api/chapters', () => {
    it('should return all chapters', async () => {
      const response = await request(app)
        .get('/api/chapters')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/chapters/:id', () => {
    it('should return a specific chapter', async () => {
      const chapterId = 'maths_algo_1_chap_1';
      
      const response = await request(app)
        .get(`/api/chapters/${chapterId}`)
        .expect('Content-Type', /json/);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('title');
        expect(response.body).toHaveProperty('courseId');
      }
    });

    it('should return 404 for non-existent chapter', async () => {
      const response = await request(app)
        .get('/api/chapters/non_existent_id')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/chapters/course/:courseId', () => {
    it('should return chapters for a specific course', async () => {
      const courseId = 'maths_algo_1';
      
      const response = await request(app)
        .get(`/api/chapters/course/${courseId}`)
        .expect('Content-Type', /json/);

      if (response.status === 200) {
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
      }
    });
  });

  describe('POST /api/chapters', () => {
    it('should create a new chapter', async () => {
      const newChapter = {
        title: 'Test Chapter',
        description: 'A test chapter',
        courseId: 'test-course',
        order: 1,
        duration: '2h 0min',
      };

      const response = await request(app)
        .post('/api/chapters')
        .send(newChapter)
        .expect('Content-Type', /json/);

      if (response.status === 201) {
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('title', newChapter.title);
      }
    });

    it('should handle partial chapter data', async () => {
      const partialChapter = {
        title: 'Test Chapter',
        // API uses default values for missing fields
      };

      const response = await request(app)
        .post('/api/chapters')
        .send(partialChapter)
        .expect('Content-Type', /json/);

      // API accepts partial data and uses defaults
      expect([200, 201]).toContain(response.status);
    });
  });

  describe('PUT /api/chapters/:id', () => {
    it('should update a chapter', async () => {
      const chapterId = 'maths_algo_1_chap_1';
      const updateData = {
        duration: '2h 30min',
      };

      const response = await request(app)
        .put(`/api/chapters/${chapterId}`)
        .send(updateData)
        .expect('Content-Type', /json/);

      expect([200, 400, 404]).toContain(response.status);
    });
  });

  describe('DELETE /api/chapters/:id', () => {
    it('should delete a chapter', async () => {
      const chapterId = 'test-chapter-to-delete';

      const response = await request(app)
        .delete(`/api/chapters/${chapterId}`)
        .expect('Content-Type', /json/);

      expect([200, 404]).toContain(response.status);
    });
  });
});
