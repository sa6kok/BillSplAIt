const request = require('supertest');
const app = require('../src/app');

describe('Health API', () => {
  test('should return healthy status', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok', message: 'BillSplAIt backend is healthy' });
  });
});

describe('API Docs', () => {
  test('GET /api/docs redirects or serves Swagger UI (2xx or 3xx)', async () => {
    const response = await request(app).get('/api/docs');
    expect(response.status).toBeLessThan(400);
  });

  test('GET /api/docs.json returns valid OpenAPI JSON', async () => {
    const response = await request(app).get('/api/docs.json');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('openapi');
    expect(response.body).toHaveProperty('info');
    expect(response.body).toHaveProperty('paths');
  });
});
