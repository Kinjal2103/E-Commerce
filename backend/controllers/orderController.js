const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const { AppError, catchAsync } = require('../middleware/errorMiddleware');

exports.createOrder = catchAsync(async (req, res, next) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    taxPrice,
    shippingPrice,
    totalPrice
  } = req.body;

  if (!orderItems || orderItems.length === 0) {
    return next(new AppError('Your shopping cart is empty.', 400));
  }

  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (!product) {
      return next(new AppError(`Product matching code "${item.product}" was not found.`, 404));
    }

    if (product.stock < item.qty) {
      return next(
        new AppError(
          `Insufficient inventory for "${product.name}". Requested: ${item.qty}, remaining: ${product.stock}`,
          400
        )
      );
    }
  }

  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.qty }
    });
  }

  const newOrder = await Order.create({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod,
    taxPrice,
    shippingPrice,
    totalPrice
  });

  res.status(201).json({
    success: true,
    data: {
      order: newOrder
    }
  });
});

exports.getOrderById = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('orderItems.product', 'name price imageUrl');

  if (!order) {
    return next(new AppError('No order found with the provided identifier.', 404));
  }

  if (
    order.user._id.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    return next(new AppError('You are not authorized to view this order details.', 403));
  }

  res.status(200).json({
    success: true,
    data: {
      order
    }
  });
});

exports.getMyOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
  res.status(200).json({
    success: true,
    data: {
      orders
    }
  });
});
