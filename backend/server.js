require('dotenv').config();
const express = require('express');
const cors = require('cors');
const apiRouter = require('./api');
const errorHandler = require('./api/shared/errorHandler');
const sanitizeRequest = require('./api/shared/sanitization');
const path = require('path');
const fs = require('fs');
const prisma = require('./prisma');

const app = express();

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CORS_ORIGIN 
    : 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // Cache preflight requests for 24 hours
}));

// Basic middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitize all requests
app.use(sanitizeRequest);

// Serve static files from uploads
const uploadsPath = path.resolve('uploads');
const imagesPath = path.join(uploadsPath, 'images');
const videosPath = path.join(uploadsPath, 'videos');

// Create directories if they don't exist
[uploadsPath, imagesPath, videosPath].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Serve static files with proper caching and security headers
app.use('/uploads', express.static(uploadsPath, {
  maxAge: '1h',
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('X-Content-Type-Options', 'nosniff');
  }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Mount API routes
app.use('/api', (req, res, next) => {
  console.log('API request received:', {
    method: req.method,
    path: req.path,
    headers: {
      authorization: req.headers.authorization ? 'Bearer [REDACTED]' : undefined,
      'content-type': req.headers['content-type']
    }
  });
  next();
});

app.use('/api', apiRouter);

// Error handling
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Don't exit the process in production, just log the error
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

module.exports = app;