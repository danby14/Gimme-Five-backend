const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  if (req.method === 'OPTIONS') {
    return next();
  }

  if (!req.headers.authorization) return res.status(401).json({ message: 'Not Authorized' });
  const token = req.headers.authorization.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access Denied' });

  try {
    const verified = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.userData = { userId: verified.id };
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid Token' });
  }
};
