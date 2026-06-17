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

describe('Balances API', () => {
  let user1Token, user2Token, user1, user2, group;

  beforeEach(async () => {
    const timestamp = Date.now();
    // Create users
    const hash1 = await bcrypt.hash('Password123', 10);
    user1 = await User.create({ name: `BalanceUser1-${timestamp}`, email: `balanceuser1-${timestamp}@example.com`, passwordHash: hash1 });
    user1Token = sign({ userId: user1.id, email: user1.email });

    const hash2 = await bcrypt.hash('Password123', 10);
    user2 = await User.create({ name: `BalanceUser2-${timestamp}`, email: `balanceuser2-${timestamp}@example.com`, passwordHash: hash2 });
    user2Token = sign({ userId: user2.id, email: user2.email });

    // Create group and add both users
    const groupRes = await request(app)
      .post('/api/groups')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ name: 'Shared', description: 'Shared expenses' });
    
    group = groupRes.body.group;

    await request(app)
      .post(`/api/groups/${group.id}/members`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ email: `balanceuser2-${timestamp}@example.com` });
  });

  test('should get user balances', async () => {
    await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        groupId: group.id,
        description: 'Dinner',
        amount: 100,
        currency: 'USD',
        shares: [
          { userId: user1.id, amount: 50 },
          { userId: user2.id, amount: 50 }
        ],
        payers: [{ userId: user1.id, amount: 100 }]
      });

    const response = await request(app)
      .get('/api/balances')
      .set('Authorization', `Bearer ${user1Token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.balances)).toBe(true);
  });

  test('should get group balances', async () => {
    await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        groupId: group.id,
        description: 'Split bill',
        amount: 60,
        currency: 'USD',
        shares: [
          { userId: user1.id, amount: 30 },
          { userId: user2.id, amount: 30 }
        ],
        payers: [{ userId: user1.id, amount: 60 }]
      });

    const response = await request(app)
      .get(`/api/balances/group/${group.id}`)
      .set('Authorization', `Bearer ${user1Token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.balances)).toBe(true);
    expect(response.body.balances.length).toBeGreaterThan(0);
  });

  test('should calculate correct due amounts', async () => {
    await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        groupId: group.id,
        description: 'Total expense',
        amount: 100,
        currency: 'USD',
        shares: [
          { userId: user1.id, amount: 40 },
          { userId: user2.id, amount: 60 }
        ],
        payers: [{ userId: user1.id, amount: 100 }]
      });

    const response = await request(app)
      .get(`/api/balances/group/${group.id}`)
      .set('Authorization', `Bearer ${user1Token}`);

    expect(response.status).toBe(200);
    const balances = response.body.balances;
    
    // user2 should owe 60
    const user2Balance = balances.find(b => b.userId === user2.id);
    expect(user2Balance).toBeDefined();
    expect(parseFloat(user2Balance.total)).toBe(60);
    expect(parseFloat(user2Balance.due)).toBe(60);
  });
});
