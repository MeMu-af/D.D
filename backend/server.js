require('dotenv').config();
const express = require('express');
const cors = require('cors');
const apiRouter = require('./api');
const errorHandler = require('./api/shared/errorHandler');
const sanitizeRequest = require('./api/shared/sanitization');
const path = require('path');
const fs = require('fs');
const prisma = require('./prisma');
const { PrismaClient } = require('@prisma/client');
const authRoutes = require('./api/auth/authRoutes');
const { authenticateToken } = require('./api/auth/authService');
const upload = require('./api/shared/multer');

const app = express();
const prismaClient = new PrismaClient();

// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173', // Vite's default port
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

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

// Profile picture access route with authentication
app.get('/api/v1/users/:id/profile-picture', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await prismaClient.user.findUnique({
      where: { id: userId },
      select: { profilePicture: true }
    });

    if (!user || !user.profilePicture) {
      return res.status(404).json({ error: 'Profile picture not found' });
    }

    const imagePath = path.join(imagesPath, user.profilePicture);
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ error: 'Profile picture file not found' });
    }

    // Set proper content type and cache headers
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.sendFile(imagePath);
  } catch (error) {
    console.error('Error serving profile picture:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Profile picture upload route
app.post('/api/v1/users/:id/profile-picture', authenticateToken, upload.single('profilePicture'), async (req, res) => {
  try {
    const userId = req.params.id;
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Update the user's profile picture in the database
    const updatedUser = await prismaClient.user.update({
      where: { id: userId },
      data: { 
        profilePicture: `/uploads/images/${req.file.filename}`,
        updatedAt: new Date()
      },
      select: { 
        id: true,
        username: true,
        email: true,
        bio: true,
        location: true,
        experience: true,
        favoriteClasses: true,
        profilePicture: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

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

// Auth routes
app.use('/api/v1/auth', authRoutes);

// Protected routes
app.put('/auth/profile', authenticateToken, require('./api/auth/authController').updateProfile);

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
const PORT = process.env.PORT || 3000;
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