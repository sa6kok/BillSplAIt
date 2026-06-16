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

exports.getExpenseById = async (req, res, next) => {
  try {
    const expense = await expenseService.getExpenseById(req.user.userId, req.params.id);
    res.json({ expense });
  } catch (error) {
    next(error);
  }
};

exports.updateExpense = async (req, res, next) => {
  try {
    const expense = await expenseService.updateExpense(req.user.userId, req.params.id, req.body);
    res.json({ expense });
  } catch (error) {
    next(error);
  }
};

exports.deleteExpense = async (req, res, next) => {
  try {
    await expenseService.deleteExpense(req.user.userId, req.params.id);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
