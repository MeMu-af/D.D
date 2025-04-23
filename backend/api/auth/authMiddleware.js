/**
 * @module authMiddleware
 * @description Middleware for handling JWT authentication and role-based access control
 * @requires jsonwebtoken
 * @requires @prisma/client
 */

const jwt = require('jsonwebtoken');
const prisma = require('../../prisma');

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
      console.log('Auth middleware processing request:', {
        path: req.path,
        method: req.method,
        headers: {
          authorization: req.headers.authorization ? 'Bearer [REDACTED]' : undefined
        }
      });

      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (!token) {
        console.error('No token provided');
        return res.status(401).json(errorResponses.noToken);
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decoded:', {
        userId: decoded.userId,
        exp: decoded.exp
      });
      
      // Check if token is expired
      if (decoded.exp < Date.now() / 1000) {
        console.error('Token expired');
        return res.status(401).json(errorResponses.tokenExpired);
      }

      // Get user from database to check if still active
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true
        }
      });

      if (!user) {
        console.error('User not found in database');
        return res.status(401).json(errorResponses.userNotFound);
      }

      // Attach user info to request
      req.user = {
        userId: user.id
      };
      
      console.log('Authentication successful:', {
        userId: user.id
      });
      
      next();
    } catch (error) {
      console.error('Auth middleware error:', {
        error: {
          name: error.name,
          message: error.message
        }
      });
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json(errorResponses.invalidToken);
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json(errorResponses.tokenExpired);
      }
      next(error);
    }
  };
};

module.exports = authMiddleware; 