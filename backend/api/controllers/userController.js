const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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

exports.getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({ 
      where: { id },
      include: {
        ratings: true,
        comments: true,
        messages: true,
        receivedMessages: true
      }
    });
    if (user) {
      // Remove sensitive data
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  if (id !== req.user.userId) {
    return res.status(403).json({ error: 'You can only update your own profile' });
  }
  const { username, email, bio, location, age, experience } = req.body;
  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        username,
        email,
        bio,
        location,
        age,
        experience,
      },
    });
    // Remove sensitive data
    const { password, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error updating user:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ 
        error: 'Update failed',
        details: 'Username or email already exists'
      });
    }
    res.status(500).json({ error: 'Error updating user', details: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  if (id !== req.user.userId) {
    return res.status(403).json({ error: 'You can only delete your own account' });
  }
  try {
    await prisma.user.delete({
      where: { id }
    });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Error deleting user', details: error.message });
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
  const { lat, lon, radius } = req.query; // radius in km
  if (!lat || !lon || !radius) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);
  const rad = parseFloat(radius);
  try {
    const users = await prisma.user.findMany({
      where: {
        location: { not: null }
      },
      select: {
        id: true,
        username: true,
        location: true,
        age: true,
        experience: true,
        bio: true,
        profilePicture: true
      },
    });

    // Filter users by distance
    const nearbyUsers = users.filter(user => {
      if (!user.location) return false;
      const [userLat, userLon] = user.location.split(',').map(Number);
      const distance = calculateDistance(latitude, longitude, userLat, userLon);
      return distance <= rad;
    });

    res.json(nearbyUsers);
  } catch (error) {
    console.error('Error fetching nearby users:', error);
    res.status(500).json({ error: 'Error fetching nearby users', details: error.message });
  }
};