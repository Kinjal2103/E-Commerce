/**
 * Express Application Module
 * Configures global middleware, health checkpoint, mounts route directories,
 * and registers global error handlers.
 */

const express = require('express');
const cors = require('cors');
const productRouter = require('./routes/productRoutes');
const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');
const orderRouter = require('./routes/orderRoutes');
const chatRouter = require('./routes/chatRoutes');
const communityBuildRouter = require('./routes/communityBuildRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Enable Cross-Origin Resource Sharing (CORS) for frontend integrations
app.use(cors());

// Parse incoming JSON request payloads
app.use(express.json());

// Add to app.js
app.use((req, res, next) => {
  const start = Date.now();
  
  // Hook into response finish event
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[API Performance] ${req.method} ${req.originalUrl} - Total: ${duration}ms`);
  });
  
  next();
});

// API Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server running"
  });
});

// Mount Product Routes Group
app.use('/api/products', productRouter);

// Mount Auth Routes Group
app.use('/api/auth', authRouter);

// Mount User Routes Group
app.use('/api/users', userRouter);

// Mount Order Routes Group
app.use('/api/orders', orderRouter);

// Mount Chat Routes Group
app.use('/api/chat', chatRouter);

// Mount Community Build Showcase Routes Group
app.use('/api/community-builds', communityBuildRouter);

// Undefined Route Handler (triggers 404 AppError)
app.use(notFound);

// Global Exception Interceptor Middleware
app.use(errorHandler);

module.exports = app;
