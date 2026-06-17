const User = require('../models/userModel');
const { generateToken } = require('../utils/jwt');
const { AppError, catchAsync } = require('../middleware/errorMiddleware');

const filterUserObject = (user) => {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt
  };
};

exports.register = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return next(new AppError('Please provide a name, email address, and password.', 400));
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('Email address already in use.', 400));
  }

  const newUser = await User.create({ name, email, password });
  const token = generateToken(newUser._id, newUser.role);

  res.status(201).json({
    success: true,
    token,
    data: {
      user: filterUserObject(newUser)
    }
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide both an email address and a password.', 400));
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Invalid email address or password.', 401));
  }

  const token = generateToken(user._id, user.role);

  res.status(200).json({
    success: true,
    token,
    data: {
      user: filterUserObject(user)
    }
  });
});
