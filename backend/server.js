require('dotenv').config();
const express = require('express');
const cors = require('cors');
const apiRouter = require('./api');
const testEndpoints = require('./api/test-endpoints');
const errorHandler = require('./api/shared/errorHandler');
const sanitizeRequest = require('./api/shared/sanitization');
const path = require('path');
const fs = require('fs');
const prisma = require('./prisma');

const app = express();

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Starting`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  
  // Log when the response is sent
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
  });
  
  next();
});

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

// Mount API routes with logging
app.use('/api/v1', (req, res, next) => {
  console.log('[API Request]', {
    method: req.method,
    path: req.path,
    headers: {
      authorization: req.headers.authorization ? 'Bearer [REDACTED]' : undefined,
      'content-type': req.headers['content-type']
    },
    body: req.body
  });
  next();
});

app.use('/api/v1', apiRouter);
app.use('/api/v1/test', testEndpoints);

// Error handling with detailed logging
app.use((err, req, res, next) => {
  console.error('[Error]', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    headers: req.headers,
    body: req.body
  });
  next(err);
});

app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Database URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
  console.log('JWT Secret:', process.env.JWT_SECRET ? 'Set' : 'Not set');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('[Unhandled Rejection]', {
    message: err.message,
    stack: err.stack
  });
  // Don't exit the process in production, just log the error
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

module.exports = app;