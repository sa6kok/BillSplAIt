const expenseService = require('../services/expenseService');

exports.createExpense = async (req, res, next) => {
  try {
    const expense = await expenseService.createExpense(req.user.userId, req.body);
    res.status(201).json({ expense });
  } catch (error) {
    next(error);
  }
};

exports.getGroupExpenses = async (req, res, next) => {
  try {
    const expenses = await expenseService.getExpensesForGroup(req.user.userId, req.params.groupId);
    res.json({ expenses });
  } catch (error) {
    next(error);
  }
};
