const User = require('../models/userModel');
const CommunityBuild = require('../models/communityBuildModel');
const { catchAsync } = require('../middleware/errorMiddleware');
const mongoose = require('mongoose');

// Helper to dynamically calculate and sync user showcase stats
const syncUserStats = async (userId, userDoc) => {
  const authorId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;

  const showcasePostsCount = await CommunityBuild.countDocuments({
    author: authorId,
    status: 'published'
  });

  const likeData = await CommunityBuild.aggregate([
    { $match: { author: authorId } },
    { $group: { _id: null, totalLikes: { $sum: '$likesCount' } } }
  ]);
  const totalLikesReceived = likeData.length > 0 ? likeData[0].totalLikes : 0;

  const followersCount = userDoc.followersCount || 0;
  const reputationScore = (totalLikesReceived * 5) + (showcasePostsCount * 10) + (followersCount * 2);

  // Sync back to database
  await User.findByIdAndUpdate(userId, {
    showcasePostsCount,
    totalLikesReceived,
    reputationScore
  });

  return {
    showcasePostsCount,
    totalLikesReceived,
    reputationScore
  };
};

exports.getProfile = catchAsync(async (req, res, next) => {
  const stats = await syncUserStats(req.user._id, req.user);

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
        profilePicture: req.user.profilePicture || '',
        bio: req.user.bio || '',
        followersCount: req.user.followersCount || 0,
        followingCount: req.user.followingCount || 0,
        showcasePostsCount: stats.showcasePostsCount,
        totalLikesReceived: stats.totalLikesReceived,
        reputationScore: stats.reputationScore,
        isVerifiedBuilder: req.user.isVerifiedBuilder || false,
        createdAt: req.user.createdAt
      }
    }
  });
});

exports.updateProfile = catchAsync(async (req, res, next) => {
  const { name, phone, address, profilePicture, bio } = req.body;

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { name, phone, address, profilePicture, bio },
    { returnDocument: 'after', runValidators: true }
  );

  const stats = await syncUserStats(req.user._id, updatedUser);

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
        profilePicture: updatedUser.profilePicture || '',
        bio: updatedUser.bio || '',
        followersCount: updatedUser.followersCount || 0,
        followingCount: updatedUser.followingCount || 0,
        showcasePostsCount: stats.showcasePostsCount,
        totalLikesReceived: stats.totalLikesReceived,
        reputationScore: stats.reputationScore,
        isVerifiedBuilder: updatedUser.isVerifiedBuilder || false,
        createdAt: updatedUser.createdAt
      }
    }
  });
});
