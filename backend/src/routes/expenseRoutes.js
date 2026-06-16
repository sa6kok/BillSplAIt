const express = require('express');
const expenseController = require('../controllers/expenseController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
router.use(authMiddleware);
router.post('/', expenseController.createExpense);
router.get('/group/:groupId', expenseController.getGroupExpenses);
router.get('/:id', expenseController.getExpenseById);
router.put('/:id', expenseController.updateExpense);
router.delete('/:id', expenseController.deleteExpense);

module.exports = router;
