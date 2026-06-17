const express = require('express');
const authRoutes = require('./authRoutes');
const groupRoutes = require('./groupRoutes');
const expenseRoutes = require('./expenseRoutes');
const balanceRoutes = require('./balanceRoutes');

const router = express.Router();

/**
 * @openapi
 * /health:
 *   get:
 *     tags:
 *       - Health
 *     summary: Health check
 *     description: Returns the current health status of the backend.
 *     responses:
 *       200:
 *         description: Backend is healthy.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 message:
 *                   type: string
 *                   example: BillSplAIt backend is healthy
 */
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'BillSplAIt backend is healthy' });
});
router.use('/auth', authRoutes);
router.use('/groups', groupRoutes);
router.use('/expenses', expenseRoutes);
router.use('/balances', balanceRoutes);

module.exports = router;
