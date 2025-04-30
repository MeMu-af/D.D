const express = require('express');
const router = express.Router();
const userController = require('./userController');
const { authenticateToken } = require('../auth/authService');
const multer = require('../shared/multer');
const { userValidationRules, validate } = require('../shared/validation');
const { body } = require('express-validator');
const path = require('path');
const fs = require('fs');

// Public routes
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserProfile);

// Apply auth middleware to all routes below
router.use(authenticateToken);

// Protected routes
router.get('/search', userController.searchUsers);

// User profile management
router.put('/:id', userValidationRules.update, validate, userController.updateUserProfile);
router.delete('/:id', userController.deleteUser);
router.post('/:id/profile-picture', multer.single('profilePicture'), userController.updateProfilePicture);

// Serve profile picture
router.get('/:id/profile-picture', (req, res) => {
  const userId = req.params.id;
  const user = req.user;

  // Only allow users to view their own profile picture
  if (user.id !== userId) {
    return res.status(403).json({ error: 'Unauthorized to view this profile picture' });
  }

  // Get the user's profile picture path from the database
  prisma.user.findUnique({
    where: { id: userId },
    select: { profilePicture: true }
  }).then(user => {
    if (!user || !user.profilePicture) {
      return res.status(404).json({ error: 'Profile picture not found' });
    }

    // Extract the file path from the URL
    const filePath = user.profilePicture.replace('/api/v1', '');
    const absolutePath = path.join(__dirname, '..', '..', filePath);

    // Check if file exists
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ error: 'Profile picture file not found' });
    }

    // Send the file
    res.sendFile(absolutePath);
  }).catch(error => {
    console.error('Error serving profile picture:', error);
    res.status(500).json({ error: 'Error serving profile picture' });
  });
});

// Location-based routes
router.get('/nearby', userController.getNearbyUsers);
router.post('/location', [
  body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude')
], validate, userController.updateUserLocation);

module.exports = router;