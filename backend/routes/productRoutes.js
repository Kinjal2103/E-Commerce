/**
 * Product Routes Module (Refactored)
 * Exposes product read endpoints publicly, and protects write endpoints
 * (create, update, delete) to be accessible only by authenticated Admin users.
 */

const express = require('express');
const productController = require('../controllers/productController');
const { protect, restrictTo, optionalProtect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public read / Admin write endpoints
router.route('/')
  .get(productController.getProducts)
  .post(protect, restrictTo('admin'), productController.createProduct);

// Public reference routes
router.get('/categories', productController.getCategories);
router.get('/games', productController.getGames);
router.get('/community-builds', optionalProtect, productController.getCommunityBuilds);

// Public read details / Admin modify & remove endpoints
router.route('/:id')
  .get(productController.getProductById)
  .put(protect, restrictTo('admin'), productController.updateProduct)
  .delete(protect, restrictTo('admin'), productController.deleteProduct);

module.exports = router;
