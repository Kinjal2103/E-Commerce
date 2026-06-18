const express = require('express');
const chatController = require('../controllers/chatController');
const User = require('../models/userModel');
const { verifyToken } = require('../utils/jwt');

const router = express.Router();

const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
      const decoded = await verifyToken(token);
      const currentUser = await User.findById(decoded.id);
      if (currentUser) {
        req.user = currentUser;
      }
    }
  } catch (err) {
    // Soft fail
  }
  next();
};

router.post('/', optionalAuth, chatController.handleChat);

module.exports = router;
