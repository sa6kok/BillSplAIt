const { Expense, ExpenseShare, GroupMember } = require('../models');

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
    paid: share.paid
  }));
};
