/**
 * User Routes Module
 * Defines endpoints for profile and user management, securing routes using JWT verification.
 */

const express = require('express');
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Get active profile (restricted to authenticated accounts)
router.get('/profile', protect, userController.getProfile);

module.exports = router;
