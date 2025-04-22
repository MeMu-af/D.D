const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const authMiddleware = (roles = []) => {
  return async (req, res, next) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ 
          success: false,
          error: 'No token provided' 
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if token is expired
      if (decoded.exp < Date.now() / 1000) {
        return res.status(401).json({ 
          success: false,
          error: 'Token expired' 
        });
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
        return res.status(401).json({ 
          success: false,
          error: 'User not found' 
        });
      }

      if (!user.isVerified) {
        return res.status(403).json({ 
          success: false,
          error: 'Email not verified' 
        });
      }

      // Check role-based access
      if (roles.length > 0 && !roles.includes(user.role)) {
        return res.status(403).json({ 
          success: false,
          error: 'Insufficient permissions' 
        });
      }

      req.user = {
        userId: user.id,
        role: user.role
      };
      
      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          success: false,
          error: 'Invalid token' 
        });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false,
          error: 'Token expired' 
        });
      }
      res.status(500).json({ 
        success: false,
        error: 'Authentication error',
        details: error.message 
      });
    }
  };
};

module.exports = authMiddleware; 