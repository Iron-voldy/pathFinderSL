const jwt = require('jsonwebtoken');
const User = require('../user-management/models/User');

const createError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError(401, 'Authentication required');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.purpose !== 'auth') {
      throw createError(401, 'Invalid token purpose');
    }

    const user = await User.findByPk(decoded.sub);

    if (!user || !user.is_active) {
      throw createError(401, 'Authentication required');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return next(createError(401, 'Authentication required'));
  }

  if (!roles.includes(req.user.role)) {
    return next(createError(403, 'You do not have access to this resource'));
  }

  next();
};

module.exports = {
  authenticate,
  authorize,
};
