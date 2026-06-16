const request = require('supertest');
const app = require('../src/app');
const { sequelize, User } = require('../src/models');

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Auth API', () => {
  test('should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'test@example.com', password: 'Password123' });

    expect(response.status).toBe(201);
    expect(response.body.user).toHaveProperty('id');
    expect(response.body.user.email).toBe('test@example.com');
  });

  test('should not register duplicate email', async () => {
    await User.create({ name: 'Existing', email: 'duplicate@example.com', passwordHash: 'hash' });
    const response = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Duplicate', email: 'duplicate@example.com', password: 'Password123' });

    expect(response.status).toBe(409);
    expect(response.body.error.message).toBe('Email is already registered');
  });

  test('should login with valid credentials', async () => {
    const passwordHash = await require('bcrypt').hash('Password123', 10);
    await User.create({ name: 'Login User', email: 'login@example.com', passwordHash });

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@example.com', password: 'Password123' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });
});
