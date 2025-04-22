const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/multerMiddleware');

// Public routes
router.get('/', postController.getAllPosts);
router.get('/search', postController.searchPosts);
router.get('/:id', postController.getPostById);
router.get('/user/:userId', postController.getUserPosts);

// Protected routes
router.use(authMiddleware); // Apply auth middleware to all routes below

// Post management
router.post('/', upload.single('media'), postController.createPost);
router.put('/:id', upload.single('media'), postController.updatePost);
router.delete('/:id', postController.deletePost);

// Post interactions
router.post('/:id/like', postController.likePost);
router.delete('/:id/like', postController.unlikePost);
router.post('/:id/comments', postController.addComment);
router.delete('/:id/comments/:commentId', postController.deleteComment);

module.exports = router;