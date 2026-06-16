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

exports.getGroupById = async (req, res, next) => {
  try {
    const group = await groupService.getGroupById(req.user.userId, req.params.id);
    res.json({ group });
  } catch (error) {
    next(error);
  }
};

exports.addMember = async (req, res, next) => {
  try {
    const member = await groupService.addMember(req.user.userId, req.params.id, req.body);
    res.status(201).json({ member });
  } catch (error) {
    next(error);
  }
};

exports.removeMember = async (req, res, next) => {
  try {
    await groupService.removeMember(req.user.userId, req.params.id, req.params.memberId);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

exports.updateGroup = async (req, res, next) => {
  try {
    const group = await groupService.updateGroup(req.user.userId, req.params.id, req.body);
    res.json({ group });
  } catch (error) {
    next(error);
  }
};

exports.deleteGroup = async (req, res, next) => {
  try {
    await groupService.deleteGroup(req.user.userId, req.params.id);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
