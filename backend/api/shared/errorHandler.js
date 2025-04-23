/**
 * @module errorHandlerMiddleware
 * @description Centralized error handling middleware for the application
 * @requires fs
 * @requires path
 */

const fs = require('fs');
const path = require('path');

// Constants
const LOG_DIR = path.join(__dirname, '../../logs');
const ERROR_LOG_FILE = path.join(LOG_DIR, 'error.log');

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR);
}

// Cache common error responses
const errorResponses = {
  validation: {
    success: false,
    error: 'Validation Error'
  },
  invalidToken: {
    success: false,
    error: 'Invalid token'
  },
  tokenExpired: {
    success: false,
    error: 'Token expired'
  },
  uniqueConstraint: {
    success: false,
    error: 'Unique constraint violation'
  },
  notFound: {
    success: false,
    error: 'Record not found'
  },
  database: {
    success: false,
    error: 'Database error'
  },
  fileTooLarge: {
    success: false,
    error: 'File too large',
    details: 'Maximum file size is 10MB'
  },
  tooManyFiles: {
    success: false,
    error: 'Too many files',
    details: 'Maximum 1 file allowed'
  },
  invalidFileType: {
    success: false,
    error: 'Unexpected file',
    details: 'Invalid file type'
  },
  fileUpload: {
    success: false,
    error: 'File upload error'
  }
};

/**
 * Logs an error to the error log file
 * @function logError
 * @param {Object} errorLog - Error log object to write
 * @private
 */
const logError = (errorLog) => {
  fs.appendFile(
    ERROR_LOG_FILE,
    JSON.stringify(errorLog) + '\n',
    (error) => {
      if (error) console.error('Error writing to log file:', error);
    }
  );
};

/**
 * Global error handler middleware that:
 * 1. Logs errors to a file
 * 2. Handles specific error types (Validation, JWT, Prisma, Multer)
 * 3. Returns appropriate HTTP responses
 * 
 * @function errorHandler
 * @param {Error} err - The error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 * 
 * @example
 * // In your Express app:
 * app.use(errorHandler);
 */
const errorHandler = (err, req, res, next) => {
  // Log error to file
  const errorLog = {
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack
    }
  };

  logError(errorLog);

  // Handle specific error types
  if (err.name === 'ValidationError') {
    const response = { ...errorResponses.validation };
    response.details = err.message;
    return res.status(400).json(response);
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json(errorResponses.invalidToken);
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json(errorResponses.tokenExpired);
  }

  // Handle Prisma errors
  if (err.code?.startsWith('P')) {
    switch (err.code) {
      case 'P2002':
        const response = { ...errorResponses.uniqueConstraint };
        response.details = err.meta?.target?.join(', ') || 'field';
        return res.status(400).json(response);
      case 'P2025':
        return res.status(404).json(errorResponses.notFound);
      default:
        const dbResponse = { ...errorResponses.database };
        dbResponse.details = err.message;
        return res.status(500).json(dbResponse);
    }
  }

  // Handle Multer errors
  if (err.name === 'MulterError') {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json(errorResponses.fileTooLarge);
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json(errorResponses.tooManyFiles);
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json(errorResponses.invalidFileType);
      default:
        const uploadResponse = { ...errorResponses.fileUpload };
        uploadResponse.details = err.message;
        return res.status(400).json(uploadResponse);
    }
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
};

module.exports = errorHandler; 