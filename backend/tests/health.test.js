const request = require('supertest');
const app = require('../src/app');

describe('Health API', () => {
  test('should return healthy status', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok', message: 'BillSplAIt backend is healthy' });
  });
});
