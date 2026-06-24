const Product = require('../models/productModel');
const User = require('../models/userModel');
const CommunityBuild = require('../models/communityBuildModel');
const Bookmark = require('../models/bookmarkModel');
const CloneTracking = require('../models/cloneTrackingModel');
const { AppError, catchAsync } = require('../middleware/errorMiddleware');
const mongoose = require('mongoose');

// Helper to update user reputation score based on: (totalLikesReceived * 5) + (showcasePostsCount * 10) + (followersCount * 2)
const updateReputationScore = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return;

  const totalLikesReceived = user.totalLikesReceived || 0;
  const showcasePostsCount = user.showcasePostsCount || 0;
  const followersCount = user.followersCount || 0;

  user.reputationScore = (totalLikesReceived * 5) + (showcasePostsCount * 10) + (followersCount * 2);
  await user.save({ validateBeforeSave: false });
};

// Helper to estimate FPS based on CPU/GPU details
const estimateFPS = (cpuName = '', gpuName = '') => {
  const cpuLower = cpuName.toLowerCase();
  const gpuLower = gpuName.toLowerCase();
  
  let fps1080p = 100;
  let fps1440p = 70;
  let fps4K = 35;

  // Ultra high end (RTX 4090 / 5090 / RX 7900 XTX)
  if (gpuLower.includes('4090') || gpuLower.includes('5090') || gpuLower.includes('7900 xtx') || gpuLower.includes('7900xtx')) {
    fps1080p = 260;
    fps1440p = 190;
    fps4K = 95;
  }
  // High end (RTX 4080 / 4070 Ti / RX 7900 XT)
  else if (gpuLower.includes('4080') || gpuLower.includes('4070 ti') || gpuLower.includes('4070ti') || gpuLower.includes('7900 xt') || gpuLower.includes('7800 xt')) {
    fps1080p = 200;
    fps1440p = 145;
    fps4K = 65;
  }
  // Mid range (RTX 4070 / 4060 Ti / RX 7700 XT)
  else if (gpuLower.includes('4070') || gpuLower.includes('4060') || gpuLower.includes('7600') || gpuLower.includes('6700')) {
    fps1080p = 140;
    fps1440p = 95;
    fps4K = 40;
  }
  // Budget range
  else if (gpuLower.includes('1660') || gpuLower.includes('3050') || gpuLower.includes('580') || gpuLower.includes('5500')) {
    fps1080p = 80;
    fps1440p = 50;
    fps4K = 20;
  }

  // Adjust slightly for CPU bottlenecks
  if (cpuLower.includes('i3') || cpuLower.includes('ryzen 3')) {
    fps1080p = Math.round(fps1080p * 0.8);
    fps1440p = Math.round(fps1440p * 0.85);
  } else if (cpuLower.includes('i9') || cpuLower.includes('ryzen 9') || cpuLower.includes('x3d')) {
    fps1080p = Math.round(fps1080p * 1.15);
    fps1440p = Math.round(fps1440p * 1.1);
  }

  return { fps1080p, fps1440p, fps4K };
};

// Helper to estimate power consumption in Watts
const estimatePowerConsumption = (cpuName = '', gpuName = '') => {
  const cpuLower = cpuName.toLowerCase();
  const gpuLower = gpuName.toLowerCase();

  let cpuWatts = 65;
  let gpuWatts = 150;

  // CPU Wattage estimation
  if (cpuLower.includes('i9') || cpuLower.includes('9900') || cpuLower.includes('13900') || cpuLower.includes('14900')) cpuWatts = 150;
  else if (cpuLower.includes('i7') || cpuLower.includes('7700') || cpuLower.includes('13700') || cpuLower.includes('14700')) cpuWatts = 125;
  else if (cpuLower.includes('i5') || cpuLower.includes('ryzen 5')) cpuWatts = 95;

  // GPU Wattage estimation
  if (gpuLower.includes('4090') || gpuLower.includes('5090')) gpuWatts = 450;
  else if (gpuLower.includes('4080') || gpuLower.includes('3090')) gpuWatts = 320;
  else if (gpuLower.includes('4070') || gpuLower.includes('3080') || gpuLower.includes('7900')) gpuWatts = 250;
  else if (gpuLower.includes('4060') || gpuLower.includes('3070') || gpuLower.includes('7800')) gpuWatts = 200;

  // System overhead (RAM, Storage, Fans, Cooler, Motherboard) estimate around 75W
  return cpuWatts + gpuWatts + 75;
};

// Helper to validate compatibility socket matching between CPU and Motherboard
const validateSocketCompatibility = (cpuName = '', mbName = '') => {
  const cpuLower = cpuName.toLowerCase();
  const mbLower = mbName.toLowerCase();

  // Socket configurations: Intel LGA 1700 (12th/13th/14th Gen)
  const isIntelCpu = cpuLower.includes('intel') || cpuLower.includes('core i');
  const isAmdCpu = cpuLower.includes('amd') || cpuLower.includes('ryzen');

  const isIntelMb = mbLower.includes('z790') || mbLower.includes('b760') || mbLower.includes('z690') || mbLower.includes('h610') || mbLower.includes('b660') || mbLower.includes('lga1700') || mbLower.includes('lga 1700');
  const isAmdMb = mbLower.includes('x670') || mbLower.includes('b650') || mbLower.includes('a620') || mbLower.includes('x570') || mbLower.includes('b550') || mbLower.includes('am4') || mbLower.includes('am5');

  if ((isIntelCpu && isAmdMb) || (isAmdCpu && isIntelMb)) {
    return 0; // High incompatibility (CPU and motherboard mismatch socket type)
  }

  return 100; // Perfect match
};

/**
 * Create a new Community Build showcase post
 */
exports.createCommunityBuild = catchAsync(async (req, res, next) => {
  const { buildName, buildDescription, buildPurpose, coverImage, galleryImages, videoShowcase, tags, specs, status, visibility } = req.body;

  if (!specs || typeof specs !== 'object') {
    return next(new AppError('Please provide build specifications.', 400));
  }

  const requiredSlots = ['cpu', 'gpu', 'motherboard', 'ram', 'storage', 'cooler', 'psu', 'case'];
  for (const slot of requiredSlots) {
    if (!specs[slot]) {
      return next(new AppError(`Missing component for: ${slot}`, 400));
    }
  }

  // Fetch full details of each product from the database
  const productIds = Object.values(specs);
  const products = await Product.find({ _id: { $in: productIds } });

  const specsSnapshot = {};
  let totalCost = 0;

  for (const slot of requiredSlots) {
    const prodId = specs[slot];
    const product = products.find(p => p._id === prodId || p.id === prodId);

    if (!product) {
      return next(new AppError(`Product not found for spec item: ${slot} with ID: ${prodId}`, 404));
    }

    specsSnapshot[slot] = {
      productId: product._id,
      name: product.name,
      brand: product.brand || '',
      image: product.imageUrl || '',
      currentPrice: product.price,
      snapshotPrice: product.price
    };

    totalCost += product.price;
  }

  // Calculate stats
  const cpuName = specsSnapshot.cpu.name;
  const gpuName = specsSnapshot.gpu.name;
  const mbName = specsSnapshot.motherboard.name;

  const { fps1080p, fps1440p, fps4K } = estimateFPS(cpuName, gpuName);
  const powerConsumption = estimatePowerConsumption(cpuName, gpuName);
  const compatibilityScore = validateSocketCompatibility(cpuName, mbName);

  // Auto-generate tags based on parts if not provided
  const buildTags = tags || [];
  if (buildTags.length === 0) {
    if (gpuName.toUpperCase().includes('RTX 4090') || gpuName.toUpperCase().includes('RTX4090')) buildTags.push('RTX4090');
    if (gpuName.toUpperCase().includes('5090')) buildTags.push('RTX5090');
    if (cpuName.toUpperCase().includes('X3D')) buildTags.push('GamingKing');
    if (totalCost < 1000) buildTags.push('Budget');
    else if (totalCost > 2500) buildTags.push('Enthusiast');
    
    // Add default purpose tag
    if (buildPurpose) buildTags.push(buildPurpose.replace(/\s+/g, ''));
  }

  // Create document
  const communityBuild = await CommunityBuild.create({
    author: req.user._id,
    usernameSnapshot: req.user.name,
    profileImageSnapshot: req.user.profilePicture || '',
    buildName,
    buildDescription,
    buildPurpose,
    coverImage,
    galleryImages,
    videoShowcase,
    specs: specsSnapshot,
    totalCost,
    estimatedFPS1080p: fps1080p,
    estimatedFPS1440p: fps1440p,
    estimatedFPS4K: fps4K,
    powerConsumption,
    compatibilityScore,
    tags: buildTags,
    status: status || 'published',
    visibility: visibility || 'public'
  });

  // Increment creator showcase count and update reputation score
  await User.findByIdAndUpdate(req.user._id, { $inc: { showcasePostsCount: 1 } });
  await updateReputationScore(req.user._id);

  res.status(201).json({
    success: true,
    message: 'Community build post published successfully.',
    communityBuild
  });
});

/**
 * Retrieve all community builds (Feed) with filtering, pagination, and sorting
 */
exports.getAllCommunityBuilds = catchAsync(async (req, res, next) => {
  const { purpose, tag, minBudget, maxBudget, sort, page = 1, limit = 10, search } = req.query;

  // Build query filter
  const filter = { status: 'published', visibility: 'public' };

  if (purpose) {
    filter.buildPurpose = purpose;
  }

  if (tag) {
    filter.tags = tag;
  }

  if (minBudget || maxBudget) {
    filter.totalCost = {};
    if (minBudget) filter.totalCost.$gte = Number(minBudget);
    if (maxBudget) filter.totalCost.$lte = Number(maxBudget);
  }

  if (search) {
    filter.$or = [
      { buildName: { $regex: search, $options: 'i' } },
      { buildDescription: { $regex: search, $options: 'i' } },
      { usernameSnapshot: { $regex: search, $options: 'i' } }
    ];
  }

  // Determine Sorting order
  let sortQuery = { createdAt: -1 };
  if (sort === 'hot') {
    // Hot score calculation sort
    sortQuery = { likesCount: -1, commentsCount: -1, createdAt: -1 };
  } else if (sort === 'likes') {
    sortQuery = { likesCount: -1 };
  } else if (sort === 'clones') {
    sortQuery = { cloneCount: -1 };
  } else if (sort === 'budget-asc') {
    sortQuery = { totalCost: 1 };
  } else if (sort === 'budget-desc') {
    sortQuery = { totalCost: -1 };
  }

  const skip = (Number(page) - 1) * Number(limit);

  const communityBuilds = await CommunityBuild.find(filter)
    .sort(sortQuery)
    .skip(skip)
    .limit(Number(limit))
    .populate({
      path: 'author',
      select: 'name email profilePicture bio reputationScore isVerifiedBuilder'
    });

  const total = await CommunityBuild.countDocuments(filter);

  res.status(200).json({
    success: true,
    results: communityBuilds.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    communityBuilds
  });
});

/**
 * Retrieve details for a single community build
 */
exports.getCommunityBuild = catchAsync(async (req, res, next) => {
  const communityBuild = await CommunityBuild.findById(req.params.id)
    .populate({
      path: 'author',
      select: 'name email profilePicture bio reputationScore isVerifiedBuilder'
    });

  if (!communityBuild) {
    return next(new AppError('No community build found with that ID.', 404));
  }

  res.status(200).json({
    success: true,
    communityBuild
  });
});

/**
 * Update an existing community build
 */
exports.updateCommunityBuild = catchAsync(async (req, res, next) => {
  const { buildName, buildDescription, buildPurpose, coverImage, galleryImages, videoShowcase, tags, status, visibility } = req.body;

  let communityBuild = await CommunityBuild.findById(req.params.id);

  if (!communityBuild) {
    return next(new AppError('No community build found with that ID.', 404));
  }

  // Ensure user owns the build
  if (communityBuild.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('You do not have permission to update this build.', 403));
  }

  communityBuild.buildName = buildName || communityBuild.buildName;
  communityBuild.buildDescription = buildDescription || communityBuild.buildDescription;
  communityBuild.buildPurpose = buildPurpose || communityBuild.buildPurpose;
  communityBuild.coverImage = coverImage || communityBuild.coverImage;
  communityBuild.galleryImages = galleryImages || communityBuild.galleryImages;
  communityBuild.videoShowcase = videoShowcase || communityBuild.videoShowcase;
  communityBuild.tags = tags || communityBuild.tags;
  communityBuild.status = status || communityBuild.status;
  communityBuild.visibility = visibility || communityBuild.visibility;

  await communityBuild.save();

  res.status(200).json({
    success: true,
    message: 'Community build updated successfully.',
    communityBuild
  });
});

/**
 * Delete a community build
 */
exports.deleteCommunityBuild = catchAsync(async (req, res, next) => {
  const communityBuild = await CommunityBuild.findById(req.params.id);

  if (!communityBuild) {
    return next(new AppError('No community build found with that ID.', 404));
  }

  // Ensure user owns the build
  if (communityBuild.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('You do not have permission to delete this build.', 403));
  }

  // Perform deletion
  await CommunityBuild.findByIdAndDelete(req.params.id);

  // Decrement showcase posts count
  await User.findByIdAndUpdate(communityBuild.author, { $inc: { showcasePostsCount: -1 } });
  
  // Clean up associated bookmarks
  await Bookmark.deleteMany({ post: req.params.id });

  // Update reputation score of creator
  await updateReputationScore(communityBuild.author);

  res.status(200).json({
    success: true,
    message: 'Community build and associated records deleted.'
  });
});

/**
 * Toggle Liking a community build
 */
exports.toggleLikeCommunityBuild = catchAsync(async (req, res, next) => {
  const buildId = req.params.id;
  const userId = req.user._id;

  // Check build existence
  const buildExists = await CommunityBuild.findById(buildId);
  if (!buildExists) {
    return next(new AppError('No community build found with that ID.', 404));
  }

  // Try to unlike atomically (only if user has liked)
  let build = await CommunityBuild.findOneAndUpdate(
    { _id: buildId, likes: userId },
    {
      $pull: { likes: userId },
      $inc: { likesCount: -1 }
    },
    { returnDocument: 'after' }
  );

  let liked = false;
  if (build) {
    // User successfully unliked
    // Decrement author totalLikesReceived
    await User.findByIdAndUpdate(build.author, { $inc: { totalLikesReceived: -1 } });
    await updateReputationScore(build.author);
  } else {
    // Try to like atomically (only if user hasn't liked)
    build = await CommunityBuild.findOneAndUpdate(
      { _id: buildId, likes: { $ne: userId } },
      {
        $addToSet: { likes: userId },
        $inc: { likesCount: 1 }
      },
      { returnDocument: 'after' }
    );

    if (build) {
      liked = true;
      // Increment author totalLikesReceived
      await User.findByIdAndUpdate(build.author, { $inc: { totalLikesReceived: 1 } });
      await updateReputationScore(build.author);
    } else {
      // Concurrency fallback / refetch to return current count
      build = await CommunityBuild.findById(buildId);
      if (!build) {
        return next(new AppError('No community build found with that ID.', 404));
      }
      liked = build.likes.some(id => id.toString() === userId.toString());
    }
  }

  res.status(200).json({
    success: true,
    liked,
    likesCount: build.likesCount
  });
});

/**
 * Toggle Bookmarking a community build
 */
exports.toggleBookmarkCommunityBuild = catchAsync(async (req, res, next) => {
  const buildId = req.params.id;
  const userId = req.user._id;

  const build = await CommunityBuild.findById(buildId);
  if (!build) {
    return next(new AppError('No community build found with that ID.', 404));
  }

  const existingBookmark = await Bookmark.findOne({ user: userId, post: buildId });

  if (existingBookmark) {
    await Bookmark.deleteOne({ _id: existingBookmark._id });
    res.status(200).json({
      success: true,
      bookmarked: false,
      message: 'Bookmark removed.'
    });
  } else {
    await Bookmark.create({ user: userId, post: buildId });
    res.status(200).json({
      success: true,
      bookmarked: true,
      message: 'Bookmark added successfully.'
    });
  }
});

/**
 * Clone build tracking: Record user cloning/importing a community build into PC Builder
 */
exports.cloneCommunityBuild = catchAsync(async (req, res, next) => {
  const buildId = req.params.id;
  const userId = req.user._id;

  const build = await CommunityBuild.findById(buildId);
  if (!build) {
    return next(new AppError('No community build found with that ID.', 404));
  }

  // Create clone tracking record
  await CloneTracking.create({
    user: userId,
    post: buildId
  });

  // Increment clone count on the build post
  build.cloneCount += 1;
  await build.save();

  // Return the full specs snapshot details to load directly into frontend PC Builder state
  res.status(200).json({
    success: true,
    message: 'Build successfully imported/cloned.',
    cloneCount: build.cloneCount,
    // Return specs mapped exactly to what the React PC Builder stores (products by details)
    specs: build.snapshotSpecs
  });
});

/**
 * Add a comment (and parentComment if nested reply)
 */
exports.addComment = catchAsync(async (req, res, next) => {
  const { content, parentCommentId } = req.body;
  const buildId = req.params.id;

  if (!content || !content.trim()) {
    return next(new AppError('Comment content cannot be empty.', 400));
  }

  const buildExists = await CommunityBuild.findById(buildId);
  if (!buildExists) {
    return next(new AppError('No community build found with that ID.', 404));
  }

  // If nested reply, check parent comment validity
  if (parentCommentId) {
    const parentCommentExists = buildExists.comments.some(c => c._id.toString() === parentCommentId.toString());
    if (!parentCommentExists) {
      return next(new AppError('Parent comment does not exist.', 400));
    }
  }

  const commentId = new mongoose.Types.ObjectId();
  const comment = {
    _id: commentId,
    author: req.user._id,
    content: content.trim(),
    parentCommentId: parentCommentId || null
  };

  // Push new comment and increment commentsCount atomically
  const build = await CommunityBuild.findByIdAndUpdate(
    buildId,
    {
      $push: { comments: comment },
      $inc: { commentsCount: 1 }
    },
    { returnDocument: 'after', runValidators: true }
  ).populate({
    path: 'comments.author',
    select: 'name profilePicture isVerifiedBuilder'
  });

  if (!build) {
    return next(new AppError('No community build found with that ID.', 404));
  }

  const populatedComment = build.comments.find(c => c._id.toString() === commentId.toString());

  res.status(201).json({
    success: true,
    comment: populatedComment
  });
});

/**
 * Retrieve comments for a build (supports nested replies lookup)
 */
exports.getComments = catchAsync(async (req, res, next) => {
  const buildId = req.params.id;

  const build = await CommunityBuild.findById(buildId).populate({
    path: 'comments.author',
    select: 'name profilePicture isVerifiedBuilder'
  });

  if (!build) {
    return next(new AppError('No community build found with that ID.', 404));
  }

  // Build root comments and nest replies in memory
  const rawComments = build.comments.map(c => c.toObject());
  const rootComments = rawComments.filter(c => !c.parentCommentId);

  rootComments.forEach(parent => {
    parent.replies = rawComments.filter(c => c.parentCommentId && c.parentCommentId.toString() === parent._id.toString());
  });

  // Sort newest comments first
  rootComments.sort((a, b) => b.createdAt - a.createdAt);

  res.status(200).json({
    success: true,
    results: rootComments.length,
    comments: rootComments
  });
});

/**
 * Delete a comment
 */
exports.deleteComment = catchAsync(async (req, res, next) => {
  const commentId = req.params.commentId;

  const build = await CommunityBuild.findOne({ 'comments._id': commentId });
  if (!build) {
    return next(new AppError('No comment found with that ID.', 404));
  }

  const commentIndex = build.comments.findIndex(c => c._id.toString() === commentId.toString());
  const comment = build.comments[commentIndex];

  // Ensure owner or admin or post author can delete it
  if (
    comment.author.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin' &&
    build.author.toString() !== req.user._id.toString()
  ) {
    return next(new AppError('You do not have permission to delete this comment.', 403));
  }

  // Collect target IDs (the comment itself and all replies pointing to it)
  const idsToDelete = [commentId.toString()];
  build.comments.forEach(c => {
    if (c.parentCommentId && c.parentCommentId.toString() === commentId.toString()) {
      idsToDelete.push(c._id.toString());
    }
  });

  // Perform atomic pull and count decrement
  await CommunityBuild.findByIdAndUpdate(
    build._id,
    {
      $pull: { comments: { _id: { $in: idsToDelete } } },
      $inc: { commentsCount: -idsToDelete.length }
    }
  );

  res.status(200).json({
    success: true,
    message: 'Comment deleted successfully.'
  });
});

/**
 * Fetch stats/rankings of top community builds (Aggregation Pipeline example)
 */
exports.getFeaturedRankings = catchAsync(async (req, res, next) => {
  // Use aggregation to score posts: (likes * 3) + (clones * 5) + (comments * 2)
  const rankings = await CommunityBuild.aggregate([
    {
      $match: { status: 'published', visibility: 'public' }
    },
    {
      $project: {
        buildName: 1,
        usernameSnapshot: 1,
        profileImageSnapshot: 1,
        coverImage: 1,
        totalCost: 1,
        likesCount: 1,
        commentsCount: 1,
        cloneCount: 1,
        score: {
          $add: [
            { $multiply: ['$likesCount', 3] },
            { $multiply: ['$cloneCount', 5] },
            { $multiply: ['$commentsCount', 2] }
          ]
        }
      }
    },
    {
      $sort: { score: -1, createdAt: -1 }
    },
    {
      $limit: 5
    }
  ]);

  res.status(200).json({
    success: true,
    rankings
  });
});
