const express = require('express');
const router = express.Router();
const authController = require('./authController');
const authMiddleware = require('./authMiddleware');
const { userValidationRules, validate } = require('../shared/validation');

// Basic auth routes
router.post('/register', userValidationRules.register, validate, authController.register);
router.post('/login', userValidationRules.login, validate, authController.login);
router.get('/me', authMiddleware(), authController.getCurrentUser);
router.put('/profile', authMiddleware(), authController.updateProfile);

module.exports = router;