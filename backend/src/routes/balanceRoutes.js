const express = require('express');
const balanceController = require('../controllers/balanceController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
router.use(authMiddleware);
router.get('/', balanceController.getBalances);
router.get('/group/:groupId', balanceController.getGroupBalances);

module.exports = router;
