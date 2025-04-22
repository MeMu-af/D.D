const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/multerMiddleware');

// Public routes
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);

// Protected routes
router.use(authMiddleware); // Apply auth middleware to all routes below

// User profile management
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.post('/:id/profile-picture', upload.single('profilePicture'), userController.updateProfilePicture);

// Location-based routes
router.get('/nearby', userController.getNearbyUsers);
router.post('/location', userController.updateUserLocation);

module.exports = router;