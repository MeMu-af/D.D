const express = require('express');
const router = express.Router();
const postController = require('./postController');
const authMiddleware = require('../auth/authMiddleware');
const multer = require('../shared/multer');
const { postValidationRules, commentValidationRules, validate } = require('../shared/validation');
const { body } = require('express-validator');

// Public routes
router.get('/', postController.getAllPosts);
router.get('/search', [
  body('query').optional().isString().trim()
], validate, postController.searchPosts);
router.get('/:id', postController.getPostById);
router.get('/user/:userId', postController.getUserPosts);

// Protected routes
router.use(authMiddleware); // Apply auth middleware to all routes below

// Post management
router.post('/', 
  (req, res, next) => {
    // Check if the request is multipart/form-data
    if (req.headers['content-type']?.includes('multipart/form-data')) {
      multer.single('media')(req, res, next);
    } else {
      next();
    }
  },
  postValidationRules.create,
  validate,
  postController.createPost
);

router.put('/:id', multer.single('media'), postValidationRules.update, validate, postController.updatePost);
router.delete('/:id', postController.deletePost);

// Post interactions
router.post('/:id/like', postController.likePost);
router.delete('/:id/like', postController.unlikePost);
router.post('/:id/comments', commentValidationRules.create, validate, postController.addComment);
router.delete('/:id/comments/:commentId', postController.deleteComment);

module.exports = router;