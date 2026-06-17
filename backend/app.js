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
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Enable Cross-Origin Resource Sharing (CORS) for frontend integrations
app.use(cors());

// Parse incoming JSON request payloads
app.use(express.json());

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

// Undefined Route Handler (triggers 404 AppError)
app.use(notFound);

// Global Exception Interceptor Middleware
app.use(errorHandler);

module.exports = app;
