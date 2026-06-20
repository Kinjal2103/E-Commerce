const express = require('express');
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/profile', protect, userController.getProfile);
router.patch('/profile', protect, userController.updateProfile);

module.exports = router;
