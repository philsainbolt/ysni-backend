const request = require('supertest');
const app = require('../src/server');
const errorHandler = require('../src/middleware/errorHandler');

describe('Challenge read endpoints', () => {
  it('GET /api/challenges returns challenge metadata without secret_password', async () => {
    const res = await request(app).get('/api/challenges');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(5);
    expect(res.body[0].secret_password).toBeUndefined();
  });

  it('GET /api/challenges/:id returns 404 for unknown challenge', async () => {
    const res = await request(app).get('/api/challenges/42');
    expect(res.statusCode).toBe(404);
  });
});

describe('errorHandler middleware', () => {
  function createRes() {
    return {
      statusCode: null,
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        this.body = payload;
        return this;
      },
    };
  }

  it('maps known errors and falls back to 500', () => {
    const req = {};
    const next = jest.fn();

    const validationRes = createRes();
    errorHandler({ name: 'ValidationError', message: 'bad' }, req, validationRes, next);
    expect(validationRes.statusCode).toBe(400);

    const castRes = createRes();
    errorHandler({ name: 'CastError' }, req, castRes, next);
    expect(castRes.statusCode).toBe(400);

    const dupRes = createRes();
    errorHandler({ code: 11000 }, req, dupRes, next);
    expect(dupRes.statusCode).toBe(409);

    const genericRes = createRes();
    errorHandler({ message: 'boom' }, req, genericRes, next);
    expect(genericRes.statusCode).toBe(500);
  });
});
