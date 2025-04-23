const express = require('express');
const router = express.Router();

const userRoutes = require('./users/userRoutes');
const authRoutes = require('./auth/authRoutes');
const postRoutes = require('./posts/postRoutes');
const errorHandler = require('./shared/errorHandler');

// Mount routes directly without version prefix since it's already in the base URL
router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/posts', postRoutes);

// API documentation routes
router.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the API',
    version: '1.0',
    documentation: `${req.baseUrl}`,
    endpoints: {
      auth: '/auth',
      users: '/users',
      posts: '/posts'
    }
  });
});

router.get('/docs', (req, res) => {
  res.json({
    message: 'API Documentation',
    version: '1.0',
    endpoints: {
      auth: {
        base: '/auth',
        routes: {
          register: { method: 'POST', path: '/register' },
          login: { method: 'POST', path: '/login' },
          refreshToken: { method: 'POST', path: '/refresh-token' }
        }
      },
      users: {
        base: '/users',
        routes: {
          getAllUsers: { method: 'GET', path: '/' },
          getUserProfile: { method: 'GET', path: '/:userId' },
          updateProfile: { method: 'PUT', path: '/:userId' },
          deleteUser: { method: 'DELETE', path: '/:userId' },
          getUserPosts: { method: 'GET', path: '/:userId/posts' },
          updateProfilePicture: { method: 'PUT', path: '/:userId/profile-picture' },
          findNearbyUsers: { method: 'GET', path: '/nearby' }
        }
      },
      posts: {
        base: '/posts',
        routes: {
          getAllPosts: { method: 'GET', path: '/' },
          createPost: { method: 'POST', path: '/' },
          getPost: { method: 'GET', path: '/:postId' },
          updatePost: { method: 'PUT', path: '/:postId' },
          deletePost: { method: 'DELETE', path: '/:postId' },
          likePost: { method: 'POST', path: '/:postId/like' },
          unlikePost: { method: 'DELETE', path: '/:postId/like' },
          addComment: { method: 'POST', path: '/:postId/comments' },
          deleteComment: { method: 'DELETE', path: '/:postId/comments/:commentId' }
        }
      }
    }
  });
});

// Catch 404 and forward to error handler
router.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});

// Error handling
router.use(errorHandler);

module.exports = router; 