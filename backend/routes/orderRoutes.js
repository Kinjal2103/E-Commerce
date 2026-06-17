/**
 * Order Routes Module
 * Defines endpoints for ordering and checkout, protected by authentication middlewares.
 */

const express = require('express');
const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply auth protect guard to all order endpoints
router.use(protect);

// POST /api/orders/checkout -> Place checkout order
router.post('/checkout', orderController.createOrder);

// GET /api/orders/:id -> Fetch single order details (Owner or Admin access verified in controller)
router.get('/:id', orderController.getOrderById);

module.exports = router;
