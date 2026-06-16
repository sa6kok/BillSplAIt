const request = require('supertest');
const app = require('../src/app');
const { sequelize, User, Group } = require('../src/models');
const { sign } = require('../src/utils/jwt');
const bcrypt = require('bcrypt');

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Groups API', () => {
  let ownerToken, memberToken, ownerUser, memberUser, group;

  beforeEach(async () => {
    const timestamp = Date.now();
    // Create owner user
    const ownerPasswordHash = await bcrypt.hash('Password123', 10);
    ownerUser = await User.create({ name: `Owner-${timestamp}`, email: `owner-${timestamp}@example.com`, passwordHash: ownerPasswordHash });
    ownerToken = sign({ userId: ownerUser.id, email: ownerUser.email });

    // Create member user
    const memberPasswordHash = await bcrypt.hash('Password123', 10);
    memberUser = await User.create({ name: `Member-${timestamp}`, email: `member-${timestamp}@example.com`, passwordHash: memberPasswordHash });
    memberToken = sign({ userId: memberUser.id, email: memberUser.email });
  });

  test('should create a group', async () => {
    const response = await request(app)
      .post('/api/groups')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ name: 'Friends', description: 'Friend group' });

    expect(response.status).toBe(201);
    expect(response.body.group.name).toBe('Friends');
    group = response.body.group;
  });

  test('should list user groups', async () => {
    await request(app)
      .post('/api/groups')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ name: 'Trip', description: 'Vacation' });

    const response = await request(app)
      .get('/api/groups')
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.groups)).toBe(true);
    expect(response.body.groups.length).toBeGreaterThan(0);
  });

  test('should get a single group', async () => {
    const createRes = await request(app)
      .post('/api/groups')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ name: 'Work', description: 'Work group' });
    
    const groupId = createRes.body.group.id;

    const response = await request(app)
      .get(`/api/groups/${groupId}`)
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(response.status).toBe(200);
    expect(response.body.group.name).toBe('Work');
  });

  test('should add member to group', async () => {
    const createRes = await request(app)
      .post('/api/groups')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ name: 'Party', description: 'Party group' });

    const groupId = createRes.body.group.id;

    const response = await request(app)
      .post(`/api/groups/${groupId}/members`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ email: memberUser.email });

    expect(response.status).toBe(201);
  });

  test('should not add member as non-owner', async () => {
    const createRes = await request(app)
      .post('/api/groups')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ name: 'Secret', description: 'Secret group' });

    const groupId = createRes.body.group.id;

    // Add member first
    await request(app)
      .post(`/api/groups/${groupId}/members`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ email: memberUser.email });

    // Try to add another as member
    const response = await request(app)
      .post(`/api/groups/${groupId}/members`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ email: ownerUser.email });

    expect(response.status).toBe(403);
  });

  test('should update group', async () => {
    const createRes = await request(app)
      .post('/api/groups')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ name: 'Old Name', description: 'Old desc' });

    const groupId = createRes.body.group.id;

    const response = await request(app)
      .put(`/api/groups/${groupId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ name: 'New Name', description: 'New desc' });

    expect(response.status).toBe(200);
    expect(response.body.group.name).toBe('New Name');
  });

  test('should delete group', async () => {
    const createRes = await request(app)
      .post('/api/groups')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ name: 'Temp Group', description: 'Temporary' });

    const groupId = createRes.body.group.id;

    const response = await request(app)
      .delete(`/api/groups/${groupId}`)
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
