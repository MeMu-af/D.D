const fs = require('fs');
const path = require('path');

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

  const logDir = path.join(__dirname, '../../logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }

  fs.appendFile(
    path.join(logDir, 'error.log'),
    JSON.stringify(errorLog) + '\n',
    (error) => {
      if (error) console.error('Error writing to log file:', error);
    }
  );

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: err.message
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token expired'
    });
  }

  // Handle Prisma errors
  if (err.code?.startsWith('P')) {
    switch (err.code) {
      case 'P2002':
        return res.status(400).json({
          success: false,
          error: 'Unique constraint violation',
          details: err.meta?.target?.join(', ') || 'field'
        });
      case 'P2025':
        return res.status(404).json({
          success: false,
          error: 'Record not found'
        });
      default:
        return res.status(500).json({
          success: false,
          error: 'Database error',
          details: err.message
        });
    }
  }

  // Handle Multer errors
  if (err.name === 'MulterError') {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          error: 'File too large',
          details: 'Maximum file size is 10MB'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          error: 'Too many files',
          details: 'Maximum 1 file allowed'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          error: 'Unexpected file',
          details: 'Invalid file type'
        });
      default:
        return res.status(400).json({
          success: false,
          error: 'File upload error',
          details: err.message
        });
    }
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
};

module.exports = errorHandler; 