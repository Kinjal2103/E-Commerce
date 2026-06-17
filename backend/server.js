/**
 * Server Entry Module
 * Configures environment variables, boots the Express web server,
 * and intercepts system exception events.
 */

const dotenv = require('dotenv');
const path = require('path');

// Intercept uncaughtException sync crashes before starting server
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down server...');
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

// Load variables from environment config file
dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = require('./config/db');

// Establish connection to MongoDB
connectDB();

const app = require('./app');

// Define port binding
const PORT = process.env.PORT || 5000;

// Listen on target address
const server = app.listen(PORT, () => {
  console.log(`Server launched in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Intercept async unhandledRejection promises crashes
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down server gracefully...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
