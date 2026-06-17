/**
 * Database Connection Module
 * Handles establishing connection to the MongoDB instance using Mongoose.
 * Shuts down the process if connection initialization fails.
 */

const mongoose = require('mongoose');

/**
 * Establishes connection to MongoDB database.
 * Uses MONGODB_URI environment parameter.
 */
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is missing.');
    }

    // Set connection configurations (strictQuery is recommended in modern Mongoose versions)
    mongoose.set('strictQuery', true);

    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Failure: ${error.message}`);
    // Terminate server process on connection setup error
    process.exit(1);
  }
};

module.exports = connectDB;
