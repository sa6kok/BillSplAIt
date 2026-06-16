const { Expense, GroupMember, ExpenseShare } = require('../models');

exports.createExpense = async (userId, { groupId, description, amount, currency, date, shares }) => {
  if (!groupId || !amount || !shares || !Array.isArray(shares) || shares.length === 0) {
    const error = new Error('groupId, amount, and shares are required');
    error.status = 400;
    throw error;
  }

  const member = await GroupMember.findOne({ where: { groupId, userId } });
  if (!member) {
    const error = new Error('User is not a member of the group');
    error.status = 403;
    throw error;
  }

  const expense = await Expense.create({ groupId, createdBy: userId, description, amount, currency, date });
  const expenseShares = shares.map((share) => ({
    expenseId: expense.id,
    userId: share.userId,
    amount: share.amount,
    paid: false
  }));

  await ExpenseShare.bulkCreate(expenseShares);
  return expense;
};

exports.getExpensesForGroup = async (userId, groupId) => {
  const member = await GroupMember.findOne({ where: { groupId, userId } });
  if (!member) {
    const error = new Error('User is not a member of the group');
    error.status = 403;
    throw error;
  }

  return Expense.findAll({
    where: { groupId },
    include: [{ model: ExpenseShare, as: 'shares' }]
  });
};
