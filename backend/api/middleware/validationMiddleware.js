/**
 * @module validationMiddleware
 * @description Middleware for validating request data using express-validator
 * @requires express-validator
 */

const { validationResult } = require('express-validator');

// Cache common error response
const validationErrorResponse = {
  success: false,
  error: 'Validation failed',
  details: null
};

/**
 * Creates a middleware that validates request data using express-validator
 * @function validateRequest
 * @param {Array} validations - Array of express-validator validation chains
 * @returns {Function} Express middleware function
 * 
 * @example
 * // In your route:
 * router.post('/users', [
 *   body('email').isEmail(),
 *   body('password').isLength({ min: 6 })
 * ], validateRequest, userController.createUser);
 */
const validateRequest = (validations) => {
  return async (req, res, next) => {
    try {
      await Promise.all(validations.map(validation => validation.run(req)));

      const errors = validationResult(req);
      if (errors.isEmpty()) {
        return next();
      }

      // Reuse cached response object
      const response = { ...validationErrorResponse };
      response.details = errors.array();
      res.status(400).json(response);
    } catch (error) {
      next(error);
    }
  };
};

module.exports = validateRequest; 