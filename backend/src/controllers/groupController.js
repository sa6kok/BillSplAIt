const groupService = require('../services/groupService');

exports.createGroup = async (req, res, next) => {
  try {
    const group = await groupService.createGroup(req.user.userId, req.body);
    res.status(201).json({ group });
  } catch (error) {
    next(error);
  }
};

exports.getMyGroups = async (req, res, next) => {
  try {
    const groups = await groupService.getGroupsForUser(req.user.userId);
    res.json({ groups });
  } catch (error) {
    next(error);
  }
};
