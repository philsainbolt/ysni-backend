const request = require('supertest');
const app = require('../src/server');
const { resetProgress } = require('../src/store/progressStore');

describe('Progress endpoints', () => {
  beforeEach(() => {
    resetProgress();
  });

  it('GET /api/progress returns initial state', async () => {
    const res = await request(app).get('/api/progress');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ beaten: [], currentLevel: 1 });
  });

  it('POST /api/progress/beat/:id marks challenges as beaten and advances level', async () => {
    const beatOne = await request(app).post('/api/progress/beat/1');
    expect(beatOne.statusCode).toBe(200);
    expect(beatOne.body).toEqual({ beaten: [1], currentLevel: 2 });

    const beatTwo = await request(app).post('/api/progress/beat/2');
    expect(beatTwo.statusCode).toBe(200);
    expect(beatTwo.body).toEqual({ beaten: [1, 2], currentLevel: 3 });

    const final = await request(app).get('/api/progress');
    expect(final.body).toEqual({ beaten: [1, 2], currentLevel: 3 });
  });

  it('returns 404 for invalid challenge id', async () => {
    const res = await request(app).post('/api/progress/beat/999');
    expect(res.statusCode).toBe(404);
  });
});
