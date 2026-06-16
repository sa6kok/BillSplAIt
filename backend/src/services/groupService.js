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
