const { Expense, ExpenseShare, ExpensePayer, GroupMember, Group, User } = require('../models');

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
      { model: ExpenseShare, as: 'shares' },
      { model: ExpensePayer, as: 'payers' }
    ]
  });

  const summaries = {};
  const debts = [];

  expenses.forEach((expense) => {
    const totalPaid = expense.payers.reduce((s, p) => s + parseFloat(p.amount), 0);

    // accumulate per-user totals
    expense.shares.forEach((share) => {
      if (!summaries[share.userId]) summaries[share.userId] = { total: 0, paid: 0 };
      summaries[share.userId].total += parseFloat(share.amount);
      if (share.paid) summaries[share.userId].paid += parseFloat(share.amount);
    });

    // allocate each share across payers proportionally
    expense.shares.forEach((share) => {
      if (totalPaid <= 0) return;
      expense.payers.forEach((payer) => {
        const payerShare = (parseFloat(payer.amount) / totalPaid) * parseFloat(share.amount);
        const rounded = Math.round(payerShare * 100) / 100;
        if (rounded <= 0) return;
        if (payer.userId !== share.userId) {
          debts.push({ from: share.userId, to: payer.userId, amount: rounded, expenseId: expense.id });
        }
        // count payer's paid contribution
        if (!summaries[payer.userId]) summaries[payer.userId] = { total: 0, paid: 0 };
        summaries[payer.userId].paid += rounded;
      });
    });
  });

  // Fetch all users in group for enrichment
  const groupMembers = await GroupMember.findAll({
    where: { groupId }
  });

  const memberUserIds = groupMembers.map((gm) => gm.userId);
  const users = await User.findAll({
    where: { id: memberUserIds }
  });

  const userMap = {};
  users.forEach((u) => {
    userMap[u.id] = { name: u.name, email: u.email };
  });

  const summaryArray = Object.entries(summaries).map(([userId, balance]) => ({
    userId,
    userName: userMap[userId]?.name || userId,
    userEmail: userMap[userId]?.email || '',
    total: Math.round((balance.total || 0) * 100) / 100,
    paid: Math.round((balance.paid || 0) * 100) / 100,
    due: Math.round(((balance.total || 0) - (balance.paid || 0)) * 100) / 100
  }));

  // Net debts between each pair so opposite directions collapse into one row.
  const pairNetMap = {};
  debts.forEach((debt) => {
    const [left, right] = [debt.from, debt.to].sort();
    const key = `${left}:${right}`;
    const signedAmount = debt.from === left ? debt.amount : -debt.amount;
    pairNetMap[key] = (pairNetMap[key] || 0) + signedAmount;
  });

  const enrichedDebts = Object.entries(pairNetMap).map(([key, netAmount]) => {
    const [left, right] = key.split(':');
    const roundedNet = Math.round(netAmount * 100) / 100;
    if (roundedNet === 0) return null;

    const from = roundedNet > 0 ? left : right;
    const to = roundedNet > 0 ? right : left;

    return {
      from,
      fromName: userMap[from]?.name || from,
      to,
      toName: userMap[to]?.name || to,
      amount: Math.abs(roundedNet)
    };
  }).filter(Boolean).sort((a, b) => {
    if (b.amount !== a.amount) return b.amount - a.amount;
    return `${a.fromName}->${a.toName}`.localeCompare(`${b.fromName}->${b.toName}`);
  });

  return { summaries: summaryArray, debts: enrichedDebts };
};
