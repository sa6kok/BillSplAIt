const express = require('express');
const groupController = require('../controllers/groupController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.post('/', groupController.createGroup);
router.get('/', groupController.getMyGroups);
router.get('/:id', groupController.getGroupById);
router.put('/:id', groupController.updateGroup);
router.delete('/:id', groupController.deleteGroup);
router.post('/:id/members', groupController.addMember);
router.delete('/:id/members/:memberId', groupController.removeMember);

module.exports = router;
