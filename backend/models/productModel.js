const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'A product must have a title.'],
      unique: true,
      trim: true,
      minlength: [3, 'A product title must be at least 3 characters long.'],
      maxlength: [120, 'A product title cannot exceed 120 characters.']
    },
    description: {
      type: String,
      required: [true, 'A product must have a description.'],
      trim: true,
      minlength: [10, 'A product description must be at least 10 characters long.']
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
    brand: {
      type: String,
      required: [true, 'A product must have a brand.'],
      trim: true
    },
    stock: {
      type: Number,
      required: [true, 'A product must have a stock quantity.'],
      min: [0, 'Stock count cannot be a negative value.'],
      default: 0
    },
    images: {
      type: [String],
      required: [true, 'A product must have at least one image.'],
      validate: {
        validator: function(val) {
          return Array.isArray(val) && val.length > 0;
        },
        message: 'A product must have at least one image URI in the images array.'
      }
    },
    ratings: {
      type: Number,
      min: [0, 'Rating score must be at least 0.'],
      max: [5, 'Rating score cannot be more than 5.'],
      default: 0
    },
    numReviews: {
      type: Number,
      min: [0, 'Number of reviews cannot be a negative value.'],
      default: 0
    },
    featured: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

productSchema.index(
  { title: 'text', brand: 'text', description: 'text' },
  {
    weights: {
      title: 10,
      brand: 5,
      description: 1
    },
    name: 'ProductTextSearchIndex'
  }
);

productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ ratings: -1 });
productSchema.index({ featured: -1 });

productSchema.virtual('isOutOfStock').get(function() {
  return this.stock <= 0;
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
