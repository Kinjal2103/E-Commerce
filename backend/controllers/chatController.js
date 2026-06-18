const ChatLog = require('../models/chatLogModel');
const Product = require('../models/productModel');
const { generateResponse } = require('../services/geminiService');
const { AppError, catchAsync } = require('../middleware/errorMiddleware');

exports.handleChat = catchAsync(async (req, res, next) => {
  const { message, sessionId } = req.body;

  if (!message || !sessionId) {
    return next(new AppError('Please provide both message and sessionId.', 400));
  }

  const logs = await ChatLog.find({ sessionId }).sort({ createdAt: 1 }).limit(10);

  const history = [];
  logs.forEach((log) => {
    history.push({ role: 'user', text: log.userMessage });
    history.push({ role: 'ai', text: log.aiResponse });
  });

  let matchingProducts = [];
  try {
    matchingProducts = await Product.find({
      $text: { $search: message }
    }).limit(5);
  } catch (err) {
    matchingProducts = [];
  }

  const aiResponse = await generateResponse(message, history, matchingProducts);

  const userId = req.user ? req.user._id : null;
  await ChatLog.create({
    userId,
    sessionId,
    userMessage: message,
    aiResponse
  });

  res.status(200).json({
    success: true,
    data: {
      message: aiResponse
    }
  });
});
