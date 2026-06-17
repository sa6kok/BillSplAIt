const balanceService = require('../services/balanceService');

exports.getBalances = async (req, res, next) => {
  try {
    const balances = await balanceService.calculateBalances(req.user.userId);
    res.json({ balances });
  } catch (error) {
    next(error);
  }
};

exports.getGroupBalances = async (req, res, next) => {
  try {
    const result = await balanceService.getGroupBalances(req.user.userId, req.params.groupId);
    if (result && result.summaries && result.debts) {
      res.json({ balances: result.summaries, debts: result.debts });
    } else {
      res.json({ balances: result });
    }
  } catch (error) {
    next(error);
  }
};
