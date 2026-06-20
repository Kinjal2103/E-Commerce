const User = require('../models/userModel');
const { catchAsync } = require('../middleware/errorMiddleware');

exports.getProfile = catchAsync(async (req, res, next) => {
  res.status(200).json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        phone: req.user.phone || '',
        address: req.user.address || '',
        createdAt: req.user.createdAt
      }
    }
  });
});

exports.updateProfile = catchAsync(async (req, res, next) => {
  const { name, phone, address } = req.body;

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { name, phone, address },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone || '',
        address: updatedUser.address || '',
        createdAt: updatedUser.createdAt
      }
    }
  });
});
