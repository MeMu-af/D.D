/**
 * @module authMiddleware
 * @description Middleware for handling JWT authentication and role-based access control
 * @requires jsonwebtoken
 * @requires @prisma/client
 */

const { verifyToken } = require('./authService');

// Cache common error responses
const errorResponses = {
  noToken: {
    success: false,
    error: 'No token provided'
  },
  tokenExpired: {
    success: false,
    error: 'Token expired'
  },
  userNotFound: {
    success: false,
    error: 'User not found'
  },
  emailNotVerified: {
    success: false,
    error: 'Email not verified'
  },
  insufficientPermissions: {
    success: false,
    error: 'Insufficient permissions'
  },
  invalidToken: {
    success: false,
    error: 'Invalid token'
  }
};

/**
 * Creates an authentication middleware that verifies JWT tokens and checks user roles
 * @function authMiddleware
 * @param {Array<string>} [roles=[]] - Array of allowed roles. If empty, any authenticated user can access
 * @returns {Function} Express middleware function
 * 
 * @example
 * // Protect a route for any authenticated user:
 * router.get('/profile', authMiddleware(), userController.getProfile);
 * 
 * @example
 * // Protect a route for admin users only:
 * router.get('/admin', authMiddleware(['admin']), adminController.getDashboard);
 */
const authMiddleware = (roles = []) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        return res.status(401).json(errorResponses.noToken);
      }

      const user = await verifyToken(token);
      
      // Check if user has required role
      if (roles.length > 0 && !roles.includes(user.role)) {
        return res.status(403).json(errorResponses.insufficientPermissions);
      }

      req.user = user;
      next();
    } catch (error) {
      if (error.message === 'Token expired') {
        return res.status(401).json(errorResponses.tokenExpired);
      }
      if (error.message === 'User not found') {
        return res.status(404).json(errorResponses.userNotFound);
      }
      return res.status(403).json(errorResponses.invalidToken);
    }
  };
};

module.exports = authMiddleware; 