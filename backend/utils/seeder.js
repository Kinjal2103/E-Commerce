const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');
const Product = require('../models/productModel');
const products = require('../data/products');

dotenv.config({ path: path.join(__dirname, '../.env') });

const normalizeSpecs = (product) => {
  const specs = { ...product.specs };
  
  if (product.category === 'CPUs') {
    if (specs.socket && !specs['Socket Type']) {
      specs['Socket Type'] = specs.socket;
    }
    if (specs.tdp_watts !== undefined && !specs['TDP']) {
      specs['TDP'] = `${specs.tdp_watts}W`;
    }
    if (specs.cores && specs.threads && !specs['Cores / Threads']) {
      specs['Cores / Threads'] = `${specs.cores} Cores / ${specs.threads} Threads`;
    }
    if (specs.base_clock_ghz && specs.boost_clock_ghz && !specs['Clock Speed']) {
      specs['Clock Speed'] = `${specs.base_clock_ghz} GHz (${specs.boost_clock_ghz} GHz Turbo)`;
    }
    if (specs.memory_support && !specs['RAM Support']) {
      specs['RAM Support'] = specs.memory_support;
    }
  }
  
  if (product.category === 'GPUs') {
    if (specs.tdp_watts !== undefined && !specs['TDP']) {
      specs['TDP'] = `${specs.tdp_watts}W`;
    }
    if (specs.vram_gb && specs.vram_type && !specs['VRAM']) {
      specs['VRAM'] = `${specs.vram_gb}GB ${specs.vram_type}`;
    }
    if (!specs['Length']) {
      specs['Length'] = '300mm';
    }
  }
  
  if (product.category === 'Motherboards') {
    if (specs.socket && !specs['Socket Type']) {
      specs['Socket Type'] = specs.socket;
    }
    if (specs.memory_type && !specs['RAM Slots']) {
      specs['RAM Slots'] = specs.memory_type;
    }
    if (specs.chipset && !specs['Chipset']) {
      specs['Chipset'] = specs.chipset;
    }
    if (specs.form_factor && !specs['Form Factor']) {
      specs['Form Factor'] = specs.form_factor;
    }
  }
  
  if (product.category === 'RAM') {
    if (specs.type && !specs['Type']) {
      specs['Type'] = specs.type;
    }
    if (specs.capacity_gb && !specs['Capacity']) {
      specs['Capacity'] = `${specs.capacity_gb}GB`;
    }
    if (specs.speed_mhz && !specs['Speed']) {
      specs['Speed'] = `${specs.speed_mhz}MHz`;
    }
  }
  
  if (product.category === 'Power Supplies') {
    if (specs.wattage !== undefined && !specs['Wattage']) {
      specs['Wattage'] = `${specs.wattage}W`;
    }
    if (specs.efficiency_rating && !specs['Efficiency Rating']) {
      specs['Efficiency Rating'] = specs.efficiency_rating;
    }
    if (specs.modularity && !specs['Modular']) {
      specs['Modular'] = specs.modularity;
    }
  }
  
  if (product.category === 'Cases') {
    if (specs.max_gpu_length_mm !== undefined && !specs['Max GPU Length']) {
      specs['Max GPU Length'] = `${specs.max_gpu_length_mm}mm`;
    }
    if (specs.motherboard_support && Array.isArray(specs.motherboard_support) && !specs['Motherboard Support']) {
      specs['Motherboard Support'] = specs.motherboard_support.join(', ');
    }
    if (specs.form_factor && !specs['Form Factor']) {
      specs['Form Factor'] = specs.form_factor;
    }
  }
  
  if (product.category === 'Storage') {
    if (specs.capacity_gb !== undefined && !specs['Capacity']) {
      specs['Capacity'] = specs.capacity_gb >= 1000 ? `${specs.capacity_gb / 1000}TB` : `${specs.capacity_gb}GB`;
    }
    if (specs.interface && !specs['Interface']) {
      specs['Interface'] = specs.interface;
    }
  }
  
  if (product.category === 'Cooling') {
    if (specs.type && !specs['Cooler Type']) {
      specs['Cooler Type'] = specs.type;
    }
    if (specs.radiator_support && !specs['Radiator Size']) {
      const radMatch = specs.radiator_support.match(/(\d+mm)/);
      specs['Radiator Size'] = radMatch ? radMatch[1] : '240mm';
    } else if (specs.type && specs.type.toLowerCase().includes('liquid') && !specs['Radiator Size']) {
      specs['Radiator Size'] = '240mm';
    }
  }
  
  return specs;
};

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
      _id: p.id,
      specs: normalizeSpecs(p),
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
