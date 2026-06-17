const express = require('express');
const balanceController = require('../controllers/balanceController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
router.use(authMiddleware);

/**
 * @openapi
 * /balances:
 *   get:
 *     tags:
 *       - Balances
 *     summary: Get overall balances for the current user across all groups
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of balances.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Balance'
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', balanceController.getBalances);

/**
 * @openapi
 * /balances/group/{groupId}:
 *   get:
 *     tags:
 *       - Balances
 *     summary: Get balances within a specific group
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Group ID
 *     responses:
 *       200:
 *         description: List of group-scoped balances.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Balance'
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Group not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/group/:groupId', balanceController.getGroupBalances);

module.exports = router;
