const { Expense, ExpenseShare, GroupMember, Group } = require('../models');

exports.calculateBalances = async (userId) => {
  const memberships = await GroupMember.findAll({ where: { userId } });
  const groupIds = memberships.map((membership) => membership.groupId);

  const shares = await ExpenseShare.findAll({
    where: { userId },
    include: [
      {
        model: Expense,
        as: 'expense',
        where: { groupId: groupIds }
      }
    ]
  });

  return shares.map((share) => ({
    expenseId: share.expenseId,
    amount: share.amount,
    paid: share.paid,
    groupId: share.expense.groupId
  }));
};

exports.getGroupBalances = async (userId, groupId) => {
  const member = await GroupMember.findOne({ where: { groupId, userId } });
  if (!member) {
    const error = new Error('User is not a member of the group');
    error.status = 403;
    throw error;
  }

  const expenses = await Expense.findAll({
    where: { groupId },
    include: [
      {
        model: ExpenseShare,
        as: 'shares'
      }
    ]
  });

  const balances = {};
  expenses.forEach((expense) => {
    expense.shares.forEach((share) => {
      if (!balances[share.userId]) {
        balances[share.userId] = { total: 0, paid: 0 };
      }
      balances[share.userId].total += parseFloat(share.amount);
      if (share.paid) {
        balances[share.userId].paid += parseFloat(share.amount);
      }
    });
  });

  return Object.entries(balances).map(([userId, balance]) => ({
    userId,
    total: balance.total,
    paid: balance.paid,
    due: balance.total - balance.paid
  }));
};
