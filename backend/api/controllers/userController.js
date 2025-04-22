const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const userService = require('../services/userService');
const authService = require('../services/authService');
const locationService = require('../services/locationService');

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        bio: true,
        location: true,
        age: true,
        experience: true,
        profilePicture: true,
        createdAt: true
      }
    });
    res.json(users);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user profile', details: error.message });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const user = await userService.updateUser(req.user.userId, req.body);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error updating user profile', details: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await userService.deleteUser(req.user.userId);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error deleting user', details: error.message });
  }
};

exports.getUserPosts = async (req, res) => {
  try {
    const posts = await userService.getUserPosts(req.params.userId);
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user posts', details: error.message });
  }
};

exports.updateProfilePicture = async (req, res) => {
  const { id } = req.params;
  if (id !== req.user.userId) {
    return res.status(403).json({ error: 'You can only update your own profile picture' });
  }
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        profilePicture: `/uploads/${req.file.filename}`
      }
    });
    res.json({ 
      message: 'Profile picture updated successfully',
      profilePicture: updatedUser.profilePicture
    });
  } catch (error) {
    console.error('Error updating profile picture:', error);
    res.status(500).json({ error: 'Error updating profile picture', details: error.message });
  }
};

exports.getNearbyUsers = async (req, res) => {
  const { lat, lon, radius } = req.query;
  if (!lat || !lon) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    const radiusKm = parseFloat(radius) || 10; // Default 10km radius

    const nearbyUsers = await locationService.findNearbyUsers(
      req.user.userId,
      latitude,
      longitude,
      radiusKm
    );

    res.json(nearbyUsers);
  } catch (error) {
    console.error('Error fetching nearby users:', error);
    res.status(500).json({ error: 'Error fetching nearby users', details: error.message });
  }
};

exports.updateUserLocation = async (req, res) => {
  const { latitude, longitude } = req.body;
  if (!latitude || !longitude) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    const updatedUser = await locationService.updateUserLocation(
      req.user.userId,
      parseFloat(latitude),
      parseFloat(longitude)
    );
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user location:', error);
    res.status(500).json({ error: 'Error updating user location', details: error.message });
  }
};