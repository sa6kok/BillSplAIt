const { Group, GroupMember, User } = require('../models');

exports.createGroup = async (userId, { name, description }) => {
  if (!name) {
    const error = new Error('Group name is required');
    error.status = 400;
    throw error;
  }

  const group = await Group.create({ name, description, ownerId: userId });
  await GroupMember.create({ groupId: group.id, userId, role: 'owner' });
  return group;
};

exports.getGroupsForUser = async (userId) => {
  return Group.findAll({
    include: [
      {
        model: User,
        as: 'members',
        through: { attributes: [] },
        attributes: ['id', 'name', 'email']
      }
    ],
    where: {
      '$members.id$': userId
    }
  });
};

exports.getGroupById = async (userId, groupId) => {
  const member = await GroupMember.findOne({ where: { groupId, userId } });
  if (!member) {
    const error = new Error('User is not a member of the group');
    error.status = 403;
    throw error;
  }

  return Group.findByPk(groupId, {
    include: [
      {
        model: User,
        as: 'members',
        through: { attributes: [] },
        attributes: ['id', 'name', 'email']
      }
    ]
  });
};

exports.addMember = async (userId, groupId, { email }) => {
  if (!email) {
    const error = new Error('Email is required');
    error.status = 400;
    throw error;
  }

  const ownerCheck = await GroupMember.findOne({ where: { groupId, userId, role: 'owner' } });
  if (!ownerCheck) {
    const error = new Error('Only group owner can add members');
    error.status = 403;
    throw error;
  }

  const userToAdd = await User.findOne({ where: { email } });
  if (!userToAdd) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  const existing = await GroupMember.findOne({ where: { groupId, userId: userToAdd.id } });
  if (existing) {
    const error = new Error('User is already a member');
    error.status = 409;
    throw error;
  }

  return GroupMember.create({ groupId, userId: userToAdd.id, role: 'member' });
};

exports.removeMember = async (userId, groupId, memberId) => {
  const ownerCheck = await GroupMember.findOne({ where: { groupId, userId, role: 'owner' } });
  if (!ownerCheck) {
    const error = new Error('Only group owner can remove members');
    error.status = 403;
    throw error;
  }

  const deleted = await GroupMember.destroy({ where: { groupId, userId: memberId } });
  if (!deleted) {
    const error = new Error('Member not found in group');
    error.status = 404;
    throw error;
  }

  return { deleted: true };
};

exports.updateGroup = async (userId, groupId, { name, description }) => {
  const ownerCheck = await GroupMember.findOne({ where: { groupId, userId, role: 'owner' } });
  if (!ownerCheck) {
    const error = new Error('Only group owner can update group');
    error.status = 403;
    throw error;
  }

  const group = await Group.findByPk(groupId);
  if (!group) {
    const error = new Error('Group not found');
    error.status = 404;
    throw error;
  }

  return group.update({ name: name || group.name, description: description || group.description });
};

exports.deleteGroup = async (userId, groupId) => {
  const ownerCheck = await GroupMember.findOne({ where: { groupId, userId, role: 'owner' } });
  if (!ownerCheck) {
    const error = new Error('Only group owner can delete group');
    error.status = 403;
    throw error;
  }

  const deleted = await Group.destroy({ where: { id: groupId } });
  if (!deleted) {
    const error = new Error('Group not found');
    error.status = 404;
    throw error;
  }

  return { deleted: true };
};
