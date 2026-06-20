const Product = require('../models/productModel');
const APIFeatures = require('../utils/apiFeatures');
const { CATEGORIES, GAMES, COMMUNITY_BUILDS } = require('../data/referenceData');
const { AppError, catchAsync } = require('../middleware/errorMiddleware');

exports.getProducts = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Product.find(), req.query)
    .search()
    .filter()
    .sort()
    .paginate();

  const products = await features.mongooseQuery;

  const totalCountFeatures = new APIFeatures(Product.find(), req.query)
    .search()
    .filter();
  const totalProductsCount = await totalCountFeatures.mongooseQuery.countDocuments();

  res.status(200).json({
    success: true,
    results: products.length,
    totalResults: totalProductsCount,
    products
  });
});

exports.getProductById = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('No product found with the specified ID.', 404));
  }

  res.status(200).json({
    success: true,
    product
  });
});

exports.createProduct = catchAsync(async (req, res, next) => {
  const newProduct = await Product.create(req.body);

  res.status(201).json({
    success: true,
    data: {
      product: newProduct
    }
  });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!updatedProduct) {
    return next(new AppError('No product found with the specified ID to update.', 404));
  }

  res.status(200).json({
    success: true,
    data: {
      product: updatedProduct
    }
  });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  const deletedProduct = await Product.findByIdAndDelete(req.params.id);

  if (!deletedProduct) {
    return next(new AppError('No product found with the specified ID to delete.', 404));
  }

  res.status(204).json({
    success: true,
    data: null
  });
});

exports.getCategories = catchAsync(async (req, res, next) => {
  res.status(200).json({
    success: true,
    categories: CATEGORIES
  });
});

exports.getGames = catchAsync(async (req, res, next) => {
  res.status(200).json({
    success: true,
    games: GAMES
  });
});

exports.getCommunityBuilds = catchAsync(async (req, res, next) => {
  res.status(200).json({
    success: true,
    communityBuilds: COMMUNITY_BUILDS
  });
});
