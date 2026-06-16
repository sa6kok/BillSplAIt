const express = require('express');
const expenseController = require('../controllers/expenseController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
router.use(authMiddleware);
router.post('/', expenseController.createExpense);
router.get('/group/:groupId', expenseController.getGroupExpenses);

module.exports = router;
