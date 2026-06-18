const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');
const Product = require('../models/productModel');
const products = require('../data/products');

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables.');
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for seeding...');

    // Drop index constraints on products collection to prevent legacy 'title_1' duplicate key errors
    try {
      await mongoose.connection.db.collection('products').dropIndexes();
      console.log('Dropped products indexes...');
    } catch (e) {
      console.log('No indexes to drop.');
    }

    await Product.deleteMany();
    console.log('Cleared existing products...');

    const seededProducts = products.map((p) => ({
      ...p,
      stock: p.stock !== undefined ? p.stock : 15
    }));

    await Product.insertMany(seededProducts);
    console.log('Seeded database successfully with mock products!');

    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Failed:', error.message);
    process.exit(1);
  }
};

seedDatabase();
