const request = require('supertest');
const app = require('../src/app');
const { sequelize, User } = require('../src/models');

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Groups API', () => {
  test('should create a new group for authenticated user', async () => {
    const passwordHash = await require('bcrypt').hash('Password123', 10);
    const user = await User.create({ name: 'Group User', email: 'group@example.com', passwordHash });
    const token = require('../src/utils/jwt').sign({ userId: user.id, email: user.email });

    const response = await request(app)
      .post('/api/groups')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Friends', description: 'Weekend dinner' });

    expect(response.status).toBe(201);
    expect(response.body.group).toHaveProperty('id');
    expect(response.body.group.name).toBe('Friends');
  });
});
