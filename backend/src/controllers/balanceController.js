const balanceService = require('../services/balanceService');

exports.getBalances = async (req, res, next) => {
  try {
    const balances = await balanceService.calculateBalances(req.user.userId);
    res.json({ balances });
  } catch (error) {
    next(error);
  }
};
