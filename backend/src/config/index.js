const isTest = process.env.NODE_ENV === 'test';

module.exports = {
  port: process.env.PORT || 4000,
  jwtSecret: process.env.JWT_SECRET || 'change-me',
  db: isTest
    ? {
        dialect: 'sqlite',
        storage: ':memory:'
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'billsplait',
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres'
      }
};
