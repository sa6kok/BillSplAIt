const request = require('supertest');
const app = require('../src/app');
const { sequelize, User, Group, Expense } = require('../src/models');
const { sign } = require('../src/utils/jwt');
const bcrypt = require('bcrypt');

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Expenses API', () => {
  let user1Token, user2Token, user1, user2, group;

  beforeEach(async () => {
    const timestamp = Date.now();
    // Create users
    const hash1 = await bcrypt.hash('Password123', 10);
    user1 = await User.create({ name: `ExpenseUser1-${timestamp}`, email: `expenseuser1-${timestamp}@example.com`, passwordHash: hash1 });
    user1Token = sign({ userId: user1.id, email: user1.email });

    const hash2 = await bcrypt.hash('Password123', 10);
    user2 = await User.create({ name: `ExpenseUser2-${timestamp}`, email: `expenseuser2-${timestamp}@example.com`, passwordHash: hash2 });
    user2Token = sign({ userId: user2.id, email: user2.email });

    // Create group and add both users
    const groupRes = await request(app)
      .post('/api/groups')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ name: 'Trip', description: 'Vacation' });
    
    group = groupRes.body.group;

    await request(app)
      .post(`/api/groups/${group.id}/members`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ email: `expenseuser2-${timestamp}@example.com` });
  });

  test('should create an expense', async () => {
    const response = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        groupId: group.id,
        description: 'Dinner',
        amount: 50,
        currency: 'USD',
        shares: [
          { userId: user1.id, amount: 25 },
          { userId: user2.id, amount: 25 }
        ]
      });

    expect(response.status).toBe(201);
    expect(response.body.expense.amount).toBe(50);
  });

  test('should get expenses for group', async () => {
    await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        groupId: group.id,
        description: 'Lunch',
        amount: 30,
        currency: 'USD',
        shares: [
          { userId: user1.id, amount: 15 },
          { userId: user2.id, amount: 15 }
        ]
      });

    const response = await request(app)
      .get(`/api/expenses/group/${group.id}`)
      .set('Authorization', `Bearer ${user1Token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.expenses)).toBe(true);
  });

  test('should get expense by ID', async () => {
    const createRes = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        groupId: group.id,
        description: 'Breakfast',
        amount: 15,
        currency: 'USD',
        shares: [{ userId: user1.id, amount: 15 }]
      });

    const expenseId = createRes.body.expense.id;

    const response = await request(app)
      .get(`/api/expenses/${expenseId}`)
      .set('Authorization', `Bearer ${user1Token}`);

    expect(response.status).toBe(200);
    expect(response.body.expense.id).toBe(expenseId);
  });

  test('should update expense', async () => {
    const createRes = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        groupId: group.id,
        description: 'Initial',
        amount: 20,
        currency: 'USD',
        shares: [{ userId: user1.id, amount: 20 }]
      });

    const expenseId = createRes.body.expense.id;

    const response = await request(app)
      .put(`/api/expenses/${expenseId}`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ description: 'Updated', amount: 25 });

    expect(response.status).toBe(200);
    expect(response.body.expense.description).toBe('Updated');
  });

  test('should delete expense', async () => {
    const createRes = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        groupId: group.id,
        description: 'Temporary',
        amount: 10,
        currency: 'USD',
        shares: [{ userId: user1.id, amount: 10 }]
      });

    const expenseId = createRes.body.expense.id;

    const response = await request(app)
      .delete(`/api/expenses/${expenseId}`)
      .set('Authorization', `Bearer ${user1Token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  test('should rollback expense creation when a share recipient is invalid', async () => {
    const response = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        groupId: group.id,
        description: 'Invalid share',
        amount: 40,
        currency: 'USD',
        shares: [
          { userId: user1.id, amount: 20 },
          { userId: '00000000-0000-0000-0000-000000000000', amount: 20 }
        ]
      });

    expect(response.status).toBe(400);
    expect(response.body.error.message).toMatch(/not members/);

    const expenseCount = await Expense.count({ where: { description: 'Invalid share' } });
    expect(expenseCount).toBe(0);
  });

  test('should not update expense as non-creator', async () => {
    const createRes = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        groupId: group.id,
        description: 'Other user',
        amount: 40,
        currency: 'USD',
        shares: [{ userId: user2.id, amount: 40 }]
      });

    const expenseId = createRes.body.expense.id;

    const response = await request(app)
      .put(`/api/expenses/${expenseId}`)
      .set('Authorization', `Bearer ${user2Token}`)
      .send({ description: 'Hacked' });

    expect(response.status).toBe(403);
  });
});
