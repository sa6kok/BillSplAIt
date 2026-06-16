const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config');

const sequelize = new Sequelize({
  ...config.db,
  logging: false
});

const User = require('./user')(sequelize, DataTypes);
const Group = require('./group')(sequelize, DataTypes);
const GroupMember = require('./groupMember')(sequelize, DataTypes);
const Expense = require('./expense')(sequelize, DataTypes);
const ExpenseShare = require('./expenseShare')(sequelize, DataTypes);

User.hasMany(Group, { foreignKey: 'ownerId', as: 'ownedGroups' });
Group.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

Group.belongsToMany(User, {
  through: GroupMember,
  foreignKey: 'groupId',
  otherKey: 'userId',
  as: 'members'
});
User.belongsToMany(Group, {
  through: GroupMember,
  foreignKey: 'userId',
  otherKey: 'groupId',
  as: 'groups'
});

Group.hasMany(Expense, { foreignKey: 'groupId', as: 'expenses' });
Expense.belongsTo(Group, { foreignKey: 'groupId', as: 'group' });

User.hasMany(Expense, { foreignKey: 'createdBy', as: 'createdExpenses' });
Expense.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

Expense.hasMany(ExpenseShare, { foreignKey: 'expenseId', as: 'shares' });
ExpenseShare.belongsTo(Expense, { foreignKey: 'expenseId', as: 'expense' });

User.hasMany(ExpenseShare, { foreignKey: 'userId', as: 'expenseShares' });
ExpenseShare.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  sequelize,
  User,
  Group,
  GroupMember,
  Expense,
  ExpenseShare
};
