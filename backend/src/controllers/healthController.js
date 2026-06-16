const healthService = require('../services/healthService');

exports.ping = async (req, res) => {
  const data = await healthService.getStatus();
  res.json(data);
};
