const { sequelize, Expense, GroupMember, ExpenseShare } = require('../models');

exports.createExpense = async (userId, { groupId, description, amount, currency, date, shares }) => {
  if (!groupId || amount == null || !shares || !Array.isArray(shares) || shares.length === 0) {
    const error = new Error('groupId, amount, and shares are required');
    error.status = 400;
    throw error;
  }

  const expenseAmount = Number(amount);
  if (!Number.isFinite(expenseAmount) || expenseAmount < 0) {
    const error = new Error('Expense amount must be a valid non-negative number');
    error.status = 400;
    throw error;
  }

  const member = await GroupMember.findOne({ where: { groupId, userId } });
  if (!member) {
    const error = new Error('User is not a member of the group');
    error.status = 403;
    throw error;
  }

  const groupMembers = await GroupMember.findAll({ where: { groupId } });
  const validMemberIds = new Set(groupMembers.map((m) => m.userId));
  const invalidShare = shares.find((share) => !validMemberIds.has(share.userId));
  if (invalidShare) {
    const error = new Error('One or more share recipients are not members of the group');
    error.status = 400;
    throw error;
  }

  const invalidShareAmount = shares.find((share) => {
    const shareAmount = Number(share.amount);
    return !Number.isFinite(shareAmount) || shareAmount < 0;
  });
  if (invalidShareAmount) {
    const error = new Error('Each share amount must be a valid non-negative number');
    error.status = 400;
    throw error;
  }

  const transaction = await sequelize.transaction();
  try {
    const expense = await Expense.create(
      { groupId, createdBy: userId, description, amount: expenseAmount, currency, date },
      { transaction }
    );

    const expenseShares = shares.map((share) => ({
      expenseId: expense.id,
      userId: share.userId,
      amount: Number(share.amount),
      paid: false
    }));

    await ExpenseShare.bulkCreate(expenseShares, { transaction });
    await transaction.commit();
    return expense;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
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

exports.getExpenseById = async (userId, expenseId) => {
  const expense = await Expense.findByPk(expenseId, {
    include: [{ model: ExpenseShare, as: 'shares' }]
  });

  if (!expense) {
    const error = new Error('Expense not found');
    error.status = 404;
    throw error;
  }

  const member = await GroupMember.findOne({ where: { groupId: expense.groupId, userId } });
  if (!member) {
    const error = new Error('User is not a member of the group');
    error.status = 403;
    throw error;
  }

  return expense;
};

exports.updateExpense = async (userId, expenseId, { description, amount, currency, date, shares }) => {
  const expense = await Expense.findByPk(expenseId);
  if (!expense) {
    const error = new Error('Expense not found');
    error.status = 404;
    throw error;
  }

  if (expense.createdBy !== userId) {
    const error = new Error('Only creator can update expense');
    error.status = 403;
    throw error;
  }

  await expense.update({
    description: description || expense.description,
    amount: amount || expense.amount,
    currency: currency || expense.currency,
    date: date || expense.date
  });

  if (shares && Array.isArray(shares)) {
    await ExpenseShare.destroy({ where: { expenseId } });
    const expenseShares = shares.map((share) => ({
      expenseId,
      userId: share.userId,
      amount: share.amount,
      paid: false
    }));
    await ExpenseShare.bulkCreate(expenseShares);
  }

  return expense;
};

exports.deleteExpense = async (userId, expenseId) => {
  const expense = await Expense.findByPk(expenseId);
  if (!expense) {
    const error = new Error('Expense not found');
    error.status = 404;
    throw error;
  }

  if (expense.createdBy !== userId) {
    const error = new Error('Only creator can delete expense');
    error.status = 403;
    throw error;
  }

  await Expense.destroy({ where: { id: expenseId } });
  return { deleted: true };
};
