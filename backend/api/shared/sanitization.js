/**
 * @module sanitizationMiddleware
 * @description Middleware for sanitizing request data to prevent XSS attacks
 * @requires sanitize-html
 */

const sanitizeHtml = require('sanitize-html');

// Cache sanitize options
const sanitizeOptions = {
  allowedTags: [],
  allowedAttributes: {}
};

/**
 * Sanitizes an object's string values
 * @param {Object} obj - Object to sanitize
 * @private
 */
const sanitizeObject = (obj) => {
  if (!obj) return;
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      obj[key] = sanitizeHtml(value, sanitizeOptions);
    }
  }
};

/**
 * Sanitizes request body and query parameters by removing HTML tags
 * @function sanitizeRequest
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 * 
 * @example
 * // In your Express app:
 * app.use(sanitizeRequest);
 */
const sanitizeRequest = (req, res, next) => {
  sanitizeObject(req.body);
  sanitizeObject(req.query);
  next();
};

module.exports = sanitizeRequest; 