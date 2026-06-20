const request = require('supertest');
const app = require('../app');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const Order = require('../models/orderModel');
const { verifyToken } = require('../utils/jwt');

jest.mock('../models/userModel');
jest.mock('../models/productModel');
jest.mock('../models/orderModel');
jest.mock('../utils/jwt');

describe('Order Controller Endpoints', () => {
  let mockUser;
  let mockProduct;
  let mockOrder;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUser = {
      _id: 'user123',
      name: 'Test User',
      email: 'test@example.com',
      role: 'user'
    };

    mockProduct = {
      _id: 'product123',
      name: 'Test Product',
      price: 100,
      stock: 10,
      imageUrl: 'test.jpg'
    };

    mockOrder = {
      _id: 'order123',
      user: 'user123',
      orderItems: [
        {
          name: 'Test Product',
          qty: 2,
          image: 'test.jpg',
          price: 100,
          product: 'product123'
        }
      ],
      shippingAddress: {
        address: '123 St',
        city: 'Delhi',
        postalCode: '110001',
        country: 'India'
      },
      paymentMethod: 'Card',
      taxPrice: 18,
      shippingPrice: 0,
      totalPrice: 218,
      orderStatus: 'Pending'
    };
  });

  describe('POST /api/orders', () => {
    it('should create a new order and return 201 on success', async () => {
      verifyToken.mockResolvedValue({ id: 'user123' });
      User.findById.mockResolvedValue(mockUser);
      Product.findById.mockResolvedValue(mockProduct);
      Product.findByIdAndUpdate.mockResolvedValue(true);
      Order.create.mockResolvedValue(mockOrder);

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', 'Bearer valid-token')
        .send({
          orderItems: [
            {
              name: 'Test Product',
              qty: 2,
              image: 'test.jpg',
              price: 100,
              product: 'product123'
            }
          ],
          shippingAddress: {
            address: '123 St',
            city: 'Delhi',
            postalCode: '110001',
            country: 'India'
          },
          paymentMethod: 'Card',
          taxPrice: 18,
          shippingPrice: 0,
          totalPrice: 218
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.order).toBeDefined();
      expect(Product.findById).toHaveBeenCalledWith('product123');
      expect(Product.findByIdAndUpdate).toHaveBeenCalled();
      expect(Order.create).toHaveBeenCalled();
    });

    it('should return 400 if cart is empty', async () => {
      verifyToken.mockResolvedValue({ id: 'user123' });
      User.findById.mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', 'Bearer valid-token')
        .send({
          orderItems: [],
          shippingAddress: {
            address: '123 St',
            city: 'Delhi',
            postalCode: '110001',
            country: 'India'
          },
          paymentMethod: 'Card',
          taxPrice: 18,
          shippingPrice: 0,
          totalPrice: 218
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('cart is empty');
    });

    it('should return 404 if product does not exist', async () => {
      verifyToken.mockResolvedValue({ id: 'user123' });
      User.findById.mockResolvedValue(mockUser);
      Product.findById.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', 'Bearer valid-token')
        .send({
          orderItems: [
            {
              name: 'Fake Product',
              qty: 2,
              image: 'test.jpg',
              price: 100,
              product: 'fake123'
            }
          ],
          shippingAddress: {
            address: '123 St',
            city: 'Delhi',
            postalCode: '110001',
            country: 'India'
          },
          paymentMethod: 'Card',
          taxPrice: 18,
          shippingPrice: 0,
          totalPrice: 218
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('was not found');
    });

    it('should return 400 if stock is insufficient', async () => {
      verifyToken.mockResolvedValue({ id: 'user123' });
      User.findById.mockResolvedValue(mockUser);
      mockProduct.stock = 1;
      Product.findById.mockResolvedValue(mockProduct);

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', 'Bearer valid-token')
        .send({
          orderItems: [
            {
              name: 'Test Product',
              qty: 2,
              image: 'test.jpg',
              price: 100,
              product: 'product123'
            }
          ],
          shippingAddress: {
            address: '123 St',
            city: 'Delhi',
            postalCode: '110001',
            country: 'India'
          },
          paymentMethod: 'Card',
          taxPrice: 18,
          shippingPrice: 0,
          totalPrice: 218
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Insufficient inventory');
    });

    it('should return 401 if unauthorized', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({
          orderItems: [
            {
              name: 'Test Product',
              qty: 2,
              image: 'test.jpg',
              price: 100,
              product: 'product123'
            }
          ]
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/orders/myorders', () => {
    it('should return orders belonging to the user', async () => {
      verifyToken.mockResolvedValue({ id: 'user123' });
      User.findById.mockResolvedValue(mockUser);

      const mockChain = {
        sort: jest.fn().mockResolvedValue([mockOrder])
      };
      Order.find.mockReturnValue(mockChain);

      const res = await request(app)
        .get('/api/orders/myorders')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.orders).toBeInstanceOf(Array);
      expect(Order.find).toHaveBeenCalledWith({ user: 'user123' });
    });

    it('should return 401 if unauthorized', async () => {
      const res = await request(app).get('/api/orders/myorders');
      expect(res.status).toBe(401);
    });
  });
});
