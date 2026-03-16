const jwt = require('jsonwebtoken');
const User = require('../models/user');
const auth = require('./auth');

module.exports = async (req, res, next) => {
  const token = auth.getToken(req.headers);
  if (!token) {
    return res.status(401).json({ status: 401, message: 'Invalid token' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(404).send({ success: false, msg: 'User not found.' });
    }
    next();
  } catch (err) {
    return res.status(403).json({ status: 403, message: 'Unauthorized', error: err.message });
  }
};
