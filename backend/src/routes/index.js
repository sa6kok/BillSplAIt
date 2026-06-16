const express = require('express');
const authRoutes = require('./authRoutes');
const groupRoutes = require('./groupRoutes');
const expenseRoutes = require('./expenseRoutes');
const balanceRoutes = require('./balanceRoutes');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'BillSplAIt backend is healthy' });
});
router.use('/auth', authRoutes);
router.use('/groups', groupRoutes);
router.use('/expenses', expenseRoutes);
router.use('/balances', balanceRoutes);

module.exports = router;
