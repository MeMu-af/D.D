const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', authMiddleware, userController.updateUser);
router.get('/nearby', userController.getNearbyUsers);

module.exports = router;