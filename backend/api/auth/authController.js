const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = new PrismaClient();
const authService = require('./authService');

// Helper function to generate verification token
const generateToken = () => crypto.randomBytes(32).toString('hex');

exports.register = async (req, res) => {
  const { username, email, password, location, latitude, longitude } = req.body;
  try {
    const locationData = location && latitude && longitude ? {
      location,
      latitude,
      longitude,
      lastLocationUpdate: new Date()
    } : {};
    
    const { token, user } = await authService.registerUser(username, email, password, locationData);
    res.status(201).json({ token, user });
  } catch (error) {
    if (error.message.includes('already exists')) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    res.status(500).json({ error: 'Error registering user', details: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await authService.loginUser(email, password);
    res.json(result);
  } catch (error) {
    if (error.message === 'User not found' || error.message === 'Invalid password') {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.status(500).json({ error: 'Error logging in', details: error.message });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        bio: true,
        location: true,
        experience: true,
        profilePicture: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user', details: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { location, experience, favoriteClasses, bio, profilePicture } = req.body;
    const userId = req.user.id;

    // Ensure favoriteClasses is an array
    const sanitizedFavoriteClasses = Array.isArray(favoriteClasses) ? favoriteClasses : [];

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        location,
        experience,
        favoriteClasses: sanitizedFavoriteClasses,
        bio,
        profilePicture,
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

    // Log the update for debugging
    console.log('Profile updated:', {
      userId: updatedUser.id,
      updatedFields: {
        location: !!location,
        experience: !!experience,
        favoriteClasses: sanitizedFavoriteClasses.length,
        bio: !!bio,
        profilePicture: !!profilePicture
      }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Error updating profile', details: error.message });
  }
};

exports.verify = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const user = await authService.verifyToken(token);
    res.json(user);
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};