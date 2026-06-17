/**
 * Authentication Routes Module
 * Defines endpoints for registration and login, mapping them to controllers.
 */

const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// Define auth endpoints
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;
