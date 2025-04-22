/**
 * @module authMiddleware
 * @description Middleware for handling JWT authentication and role-based access control
 * @requires jsonwebtoken
 * @requires @prisma/client
 */

const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

// Cache Prisma client instance
const prisma = new PrismaClient();

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
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json(errorResponses.noToken);
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if token is expired
      if (decoded.exp < Date.now() / 1000) {
        return res.status(401).json(errorResponses.tokenExpired);
      }

      // Get user from database to check if still active
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          isVerified: true,
          role: true
        }
      });

      if (!user) {
        return res.status(401).json(errorResponses.userNotFound);
      }

      if (!user.isVerified) {
        return res.status(403).json(errorResponses.emailNotVerified);
      }

      // Check role-based access
      if (roles.length > 0 && !roles.includes(user.role)) {
        return res.status(403).json(errorResponses.insufficientPermissions);
      }

      // Attach user info to request
      req.user = {
        userId: user.id,
        role: user.role
      };
      
      next();
    } catch (error) {
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