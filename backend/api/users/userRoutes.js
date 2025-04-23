const express = require('express');
const router = express.Router();
const userController = require('./userController');
const authMiddleware = require('../auth/authMiddleware');
const multer = require('../shared/multer');
const { userValidationRules, validate } = require('../shared/validation');
const { body } = require('express-validator');

// Public routes
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserProfile);

// Protected routes
router.use(authMiddleware); // Apply auth middleware to all routes below

// User profile management
router.put('/:id', userValidationRules.update, validate, userController.updateUserProfile);
router.delete('/:id', userController.deleteUser);
router.post('/:id/profile-picture', multer.single('profilePicture'), userController.updateProfilePicture);

// Location-based routes
router.get('/nearby', userController.getNearbyUsers);
router.post('/location', [
  body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude')
], validate, userController.updateUserLocation);

module.exports = router;