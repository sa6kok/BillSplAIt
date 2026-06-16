require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');
const port = process.env.PORT || 4000;

async function start() {
  await sequelize.authenticate();
  await sequelize.sync();
  app.listen(port, () => {
    console.log(`Backend listening on http://localhost:${port}`);
  });
}

start().catch((error) => {
  console.error('Server failed to start:', error);
  process.exit(1);
});
