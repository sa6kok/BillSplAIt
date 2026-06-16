const express = require('express');
const groupController = require('../controllers/groupController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.post('/', groupController.createGroup);
router.get('/', groupController.getMyGroups);

module.exports = router;
