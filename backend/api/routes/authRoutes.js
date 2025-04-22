const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Basic auth routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Password reset routes
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Email verification routes
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);

module.exports = router;