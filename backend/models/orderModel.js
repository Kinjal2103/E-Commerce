const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'An order must be linked to a registered customer.']
    },
    orderItems: [
      {
        name: {
          type: String,
          required: [true, 'Order item must state a product name.']
        },
        qty: {
          type: Number,
          required: [true, 'Order item must state a quantity.'],
          min: [1, 'Quantity of item must be at least 1.']
        },
        image: {
          type: String,
          required: [true, 'Order item must provide a preview image URL.']
        },
        price: {
          type: Number,
          required: [true, 'Order item must state price value.'],
          min: [0, 'Item price cannot be a negative value.']
        },
        product: {
          type: String,
          ref: 'Product',
          required: [true, 'Order item must reference a Product ID.']
        }
      }
    ],
    shippingAddress: {
      address: { type: String, required: [true, 'Shipping street address is required.'] },
      city: { type: String, required: [true, 'Shipping destination city is required.'] },
      postalCode: { type: String, required: [true, 'Shipping destination postal code is required.'] },
      country: { type: String, required: [true, 'Shipping destination country is required.'] }
    },
    paymentMethod: {
      type: String,
      required: [true, 'Payment processor method is required (e.g. Stripe, PayPal).']
    },
    taxPrice: {
      type: Number,
      required: [true, 'Order tax value calculation is required.'],
      default: 0.0,
      min: [0, 'Tax value cannot be negative.']
    },
    shippingPrice: {
      type: Number,
      required: [true, 'Order shipping cost calculation is required.'],
      default: 0.0,
      min: [0, 'Shipping cost cannot be negative.']
    },
    totalPrice: {
      type: Number,
      required: [true, 'Order total price calculation is required.'],
      default: 0.0,
      min: [0, 'Total price cannot be negative.']
    },
    orderStatus: {
      type: String,
      required: true,
      enum: {
        values: ['Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled'],
        message: 'Order status must be: Pending, Paid, Shipped, Delivered, or Cancelled.'
      },
      default: 'Pending'
    },
    paidAt: { type: Date },
    deliveredAt: { type: Date }
  },
  {
    timestamps: true
  }
);

orderSchema.index({ user: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
