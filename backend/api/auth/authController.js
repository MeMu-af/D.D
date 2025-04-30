const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = new PrismaClient();
const authService = require('./authService');

// Helper function to generate verification token
const generateToken = () => crypto.randomBytes(32).toString('hex');

exports.register = async (req, res) => {
  const { username, email, password, city, state, latitude, longitude } = req.body;
  try {
    const locationData = {
      city,
      state,
      ...(latitude && longitude ? {
        latitude,
        longitude,
        lastLocationUpdate: new Date()
      } : {})
    };
    
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
    // The user object is already attached by the auth middleware
    // We just need to return it
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user', details: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { city, state, experience, favoriteClasses, bio, profilePicture } = req.body;
    const userId = req.user.id;

    // Ensure favoriteClasses is an array
    const sanitizedFavoriteClasses = Array.isArray(favoriteClasses) ? favoriteClasses : [];

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        city,
        state,
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
        city: true,
        state: true,
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
        city: !!city,
        state: !!state,
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