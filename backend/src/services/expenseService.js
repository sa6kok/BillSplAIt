const { sequelize, Expense, GroupMember, ExpenseShare, ExpensePayer } = require('../models');

exports.createExpense = async (userId, { groupId, description, amount, currency, date, shares, payers }) => {
  if (!groupId || amount == null || !shares || !Array.isArray(shares) || shares.length === 0 || !payers || !Array.isArray(payers) || payers.length === 0) {
    const error = new Error('groupId, amount, shares, and payers are required');
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

  // Validate payers
  const invalidPayer = payers.find((p) => !validMemberIds.has(p.userId));
  if (invalidPayer) {
    const error = new Error('One or more payers are not members of the group');
    error.status = 400;
    throw error;
  }

  const invalidPayerAmount = payers.find((p) => {
    const amt = Number(p.amount);
    return !Number.isFinite(amt) || amt < 0;
  });
  if (invalidPayerAmount) {
    const error = new Error('Each payer amount must be a valid non-negative number');
    error.status = 400;
    throw error;
  }

  // Validation: Sum of shares must equal total expense amount
  const totalShares = shares.reduce((sum, share) => sum + Number(share.amount), 0);
  const totalSharesRounded = Math.round(totalShares * 100) / 100;
  if (Math.abs(totalSharesRounded - expenseAmount) > 0.01) {
    const error = new Error(`Sum of shares (${totalSharesRounded.toFixed(2)}) must equal the total expense amount (${expenseAmount.toFixed(2)})`);
    error.status = 400;
    throw error;
  }

  // Validation: Sum of payers must equal total expense amount
  const totalPayers = payers.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalPayersRounded = Math.round(totalPayers * 100) / 100;
  if (Math.abs(totalPayersRounded - expenseAmount) > 0.01) {
    const error = new Error(`Sum of payers (${totalPayersRounded.toFixed(2)}) must equal the total expense amount (${expenseAmount.toFixed(2)})`);
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

    const expensePayers = payers.map((p) => ({
      expenseId: expense.id,
      userId: p.userId,
      amount: Number(p.amount)
    }));

    await ExpenseShare.bulkCreate(expenseShares, { transaction });
    await ExpensePayer.bulkCreate(expensePayers, { transaction });
    await transaction.commit();

    const created = await Expense.findByPk(expense.id, {
      include: [
        { model: ExpenseShare, as: 'shares' },
        { model: ExpensePayer, as: 'payers' }
      ]
    });

    return created;
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
    include: [
      { model: ExpenseShare, as: 'shares' },
      { model: ExpensePayer, as: 'payers' }
    ]
  });
};

exports.getExpenseById = async (userId, expenseId) => {
  const expense = await Expense.findByPk(expenseId, {
    include: [
      { model: ExpenseShare, as: 'shares' },
      { model: ExpensePayer, as: 'payers' }
    ]
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

exports.updateExpense = async (userId, expenseId, { description, amount, currency, date, shares, payers }) => {
  const expense = await Expense.findByPk(expenseId, { include: [{ model: ExpensePayer, as: 'payers' }] });
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

  const transaction = await sequelize.transaction();
  try {
    await expense.update({
      description: description || expense.description,
      amount: amount || expense.amount,
      currency: currency || expense.currency,
      date: date || expense.date
    }, { transaction });

    if (shares && Array.isArray(shares)) {
      await ExpenseShare.destroy({ where: { expenseId }, transaction });
      const expenseShares = shares.map((share) => ({
        expenseId,
        userId: share.userId,
        amount: Number(share.amount),
        paid: false
      }));
      await ExpenseShare.bulkCreate(expenseShares, { transaction });
    }

    if (payers && Array.isArray(payers)) {
      await ExpensePayer.destroy({ where: { expenseId }, transaction });
      const expensePayers = payers.map((p) => ({
        expenseId,
        userId: p.userId,
        amount: Number(p.amount)
      }));
      await ExpensePayer.bulkCreate(expensePayers, { transaction });
    }

    await transaction.commit();
    const updated = await Expense.findByPk(expenseId, {
      include: [
        { model: ExpenseShare, as: 'shares' },
        { model: ExpensePayer, as: 'payers' }
      ]
    });
    return updated;
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
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
