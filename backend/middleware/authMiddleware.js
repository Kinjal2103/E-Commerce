const User = require('../models/userModel');
const { verifyToken } = require('../utils/jwt');
const { AppError, catchAsync } = require('./errorMiddleware');

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in. Please login to access this resource.', 401)
    );
  }

  const decoded = await verifyToken(token);
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError('The user belonging to this session credentials no longer exists.', 401)
    );
  }

  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have authorization permissions to access this resource.', 403)
      );
    }
    next();
  };
};
