const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: [true, 'A product must have a string ID.']
    },
    name: {
      type: String,
      required: [true, 'A product must have a name.'],
      trim: true,
      minlength: [3, 'A product name must be at least 3 characters long.']
    },
    brand: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    price: {
      type: Number,
      required: [true, 'A product must have a price.'],
      min: [0, 'Product price must be a positive number.']
    },
    category: {
      type: String,
      required: [true, 'A product must have a category.'],
      trim: true
    },
    imageUrl: {
      type: String,
      required: [true, 'A product must have an imageUrl.']
    },
    badge: {
      type: String,
      trim: true
    },
    rating: {
      type: Number,
      min: [0, 'Rating must be at least 0.'],
      max: [5, 'Rating cannot exceed 5.'],
      default: 0
    },
    reviews: {
      type: Number,
      min: [0, 'Number of reviews cannot be negative.'],
      default: 0
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    isTrending: {
      type: Boolean,
      default: false
    },
    stock: {
      type: Number,
      required: [true, 'A product must have a stock quantity.'],
      min: [0, 'Stock cannot be negative.'],
      default: 10
    },
    specs: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    pros: [
      {
        type: String
      }
    ],
    cons: [
      {
        type: String
      }
    ],
    room: {
      type: String,
      trim: true
    },
    aesthetic: {
      type: String,
      trim: true
    },
    colors: [
      {
        name: { type: String },
        hex: { type: String }
      }
    ],
    sizes: [
      {
        type: String
      }
    ],
    materials: {
      type: String
    },
    care: {
      type: String
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

productSchema.index(
  { name: 'text', brand: 'text', description: 'text' },
  {
    weights: {
      name: 10,
      brand: 5,
      description: 1
    },
    name: 'ProductTextSearchIndex'
  }
);

productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ isFeatured: -1 });

productSchema.virtual('isOutOfStock').get(function() {
  return this.stock <= 0;
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
