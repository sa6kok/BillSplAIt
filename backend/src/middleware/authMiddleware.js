const { verify } = require('../utils/jwt');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: { message: 'Authorization header missing' } });
  }

  const token = authHeader.replace('Bearer ', '');
  try {
    const payload = verify(token);
    req.user = payload;
    next();
  } catch (err) {
    res.status(401).json({ error: { message: 'Invalid or expired token' } });
  }
};
