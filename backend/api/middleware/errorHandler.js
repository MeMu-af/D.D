const errorHandler = (err, req, res, next) => {
console.error(err.stack);

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

  // Default error
res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
    });
};

module.exports = errorHandler; 