const express = require('express');
const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', orderController.createOrder);
router.post('/checkout', orderController.createOrder);
router.get('/myorders', orderController.getMyOrders);
router.get('/:id', orderController.getOrderById);

module.exports = router;
