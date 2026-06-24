const Product = require('../models/productModel');
const CommunityBuild = require('../models/communityBuildModel');
const APIFeatures = require('../utils/apiFeatures');
const { GAMES } = require('../data/referenceData');
const { AppError, catchAsync } = require('../middleware/errorMiddleware');

const computeDynamicFilters = async (queryString) => {
  const baseQuery = {};

  // Build base query mapping category and search keyword (if any)
  if (queryString.category && queryString.category !== 'All') {
    baseQuery.category = queryString.category;
  }
  
  const keyword = queryString.search || queryString.keyword;
  if (keyword) {
    baseQuery.$or = [
      { name: { $regex: keyword, $options: 'i' } },
      { brand: { $regex: keyword, $options: 'i' } },
      { category: { $regex: keyword, $options: 'i' } },
      { description: { $regex: keyword, $options: 'i' } }
    ];
  }

  // Fetch matching products to compute in-memory facets
  const products = await Product.find(baseQuery).select('price brand category specs rating stock');

  const categoriesMap = {};
  const brandsMap = {};
  const socketsMap = {};
  const ramTypesMap = { 'DDR4': 0, 'DDR5': 0 };
  const vramSizesMap = {};
  const capacitiesMap = {};
  const rgbSupportsMap = {};
  let minPrice = Infinity;
  let maxPrice = -Infinity;
  let inStockCount = 0;

  products.forEach(p => {
    // Categories count
    if (p.category) {
      categoriesMap[p.category] = (categoriesMap[p.category] || 0) + 1;
    }
    // Brand count
    if (p.brand) {
      brandsMap[p.brand] = (brandsMap[p.brand] || 0) + 1;
    }
    // Price range min and max
    if (p.price !== undefined && p.price !== null) {
      if (p.price < minPrice) minPrice = p.price;
      if (p.price > maxPrice) maxPrice = p.price;
    }
    // Stock count
    if (p.stock > 0) {
      inStockCount++;
    }

    // Specs-based facets
    if (p.specs) {
      // Socket Type
      const socket = p.specs['Socket Type'] || p.specs['socket'];
      if (socket) {
        socketsMap[socket] = (socketsMap[socket] || 0) + 1;
      }

      // Memory Generation
      const ramText = [
        p.specs['Type'],
        p.specs['RAM Slots'],
        p.specs['RAM Support'],
        p.specs['memory_support'],
        p.specs['memory_type']
      ].filter(Boolean).join(' ').toUpperCase();

      if (ramText.includes('DDR5')) ramTypesMap['DDR5']++;
      if (ramText.includes('DDR4')) ramTypesMap['DDR4']++;

      // VRAM size
      const vram = p.specs['VRAM'] || p.specs['vram_gb'];
      if (vram) {
        const vramStr = String(vram);
        const match = vramStr.match(/(\d+\s*GB|\d+G)/i);
        if (match) {
          const size = match[1].replace(/\s+/g, '').toUpperCase();
          vramSizesMap[size] = (vramSizesMap[size] || 0) + 1;
        }
      }

      // Capacity
      const cap = p.specs['Capacity'] || p.specs['capacity_gb'];
      if (cap) {
        const capStr = String(cap);
        const match = capStr.match(/(\d+\s*(TB|GB))/i);
        if (match) {
          const size = match[1].replace(/\s+/g, '').toUpperCase();
          capacitiesMap[size] = (capacitiesMap[size] || 0) + 1;
        }
      }

      // RGB
      const rgb = p.specs['rgb'] !== undefined ? p.specs['rgb'] : (p.specs['RGB Support'] || p.specs['RGB']);
      if (rgb !== undefined && rgb !== null) {
        const isRgb = rgb === true || String(rgb).toLowerCase() === 'true' || (typeof rgb === 'string' && rgb.toLowerCase() !== 'false' && rgb.trim() !== '');
        const normalizedRgb = isRgb ? 'Yes' : 'No';
        rgbSupportsMap[normalizedRgb] = (rgbSupportsMap[normalizedRgb] || 0) + 1;
      } else {
        rgbSupportsMap['No'] = (rgbSupportsMap['No'] || 0) + 1;
      }
    }
  });

  return {
    categories: Object.keys(categoriesMap).map(name => ({ name, count: categoriesMap[name] })),
    brands: Object.keys(brandsMap).map(name => ({ name, count: brandsMap[name] })),
    priceRange: {
      min: minPrice === Infinity ? 0 : minPrice,
      max: maxPrice === -Infinity ? 350000 : maxPrice
    },
    sockets: Object.keys(socketsMap).map(name => ({ name, count: socketsMap[name] })),
    ramTypes: Object.keys(ramTypesMap).map(name => ({ name, count: ramTypesMap[name] })).filter(r => r.count > 0),
    vramSizes: Object.keys(vramSizesMap).map(name => ({ name, count: vramSizesMap[name] })),
    capacities: Object.keys(capacitiesMap).map(name => ({ name, count: capacitiesMap[name] })),
    rgbSupports: Object.keys(rgbSupportsMap).map(name => ({ name, count: rgbSupportsMap[name] })),
    inStockCount
  };
};

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

  // Compute dynamic filters
  const filters = await computeDynamicFilters(req.query);

  res.status(200).json({
    success: true,
    results: products.length,
    totalResults: totalProductsCount,
    products,
    filters
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
    returnDocument: 'after',
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
  const aggregated = await Product.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);

  const iconMap = {
    'CPUs': 'memory',
    'GPUs': 'developer_board',
    'Motherboards': 'grid_view',
    'RAM': 'settings_input_component',
    'Storage': 'sd_storage',
    'Power Supplies': 'electric_bolt',
    'Cases': 'door_sliding',
    'Cooling': 'ac_unit'
  };

  const categories = aggregated.map(c => ({
    name: c._id,
    icon: iconMap[c._id] || 'category',
    count: `${c.count} Parts`
  }));

  res.status(200).json({
    success: true,
    categories
  });
});

exports.getGames = catchAsync(async (req, res, next) => {
  res.status(200).json({
    success: true,
    games: GAMES
  });
});

exports.getCommunityBuilds = catchAsync(async (req, res, next) => {
  const builds = await CommunityBuild.find({ status: 'published', visibility: 'public' })
    .populate({
      path: 'author',
      select: 'name email profilePicture'
    })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    communityBuilds: builds
  });
});

