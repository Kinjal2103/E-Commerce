/**
 * User Controller Layer
 * Handles incoming profile requests, extracting authenticated user information
 * from the request object populated by the protect middleware.
 */

const { catchAsync } = require('../middleware/errorMiddleware');

/**
 * @desc    Get current logged in user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
exports.getProfile = catchAsync(async (req, res, next) => {
  // req.user is populated by the authMiddleware.protect hook
  res.status(200).json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        createdAt: req.user.createdAt
      }
    }
  });
});
