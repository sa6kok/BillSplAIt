require('dotenv').config();

const common = {
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'billsplait',
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 5432,
  dialect: 'postgres'
};

module.exports = {
  development: common,
  test: {
    dialect: 'sqlite',
    storage: ':memory:'
  },
  production: common
};
