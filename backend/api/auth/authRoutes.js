const express = require('express');
const router = express.Router();
const authController = require('./authController');
const { userValidationRules, validate } = require('../shared/validation');
const { body } = require('express-validator');

// Basic auth routes
router.post('/register', userValidationRules.register, validate, authController.register);
router.post('/login', userValidationRules.login, validate, authController.login);

// Password reset routes
router.post('/forgot-password', 
  body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
  validate,
  authController.forgotPassword
);
router.post('/reset-password', 
  [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
  ],
  validate,
  authController.resetPassword
);

// Email verification routes
router.post('/verify-email', 
  body('token').notEmpty().withMessage('Verification token is required'),
  validate,
  authController.verifyEmail
);
router.post('/resend-verification', 
  body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
  validate,
  authController.resendVerification
);

module.exports = router;