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
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  if (parseInt(id) !== req.user.userId) {
    return res.status(403).json({ error: 'You can only update your own profile' });
  }
  const { username, email, bio, location, latitude, longitude, gamePreferences, experienceLevel, profilePicture } = req.body;
  try {
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        username,
        email,
        bio,
        location,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        gamePreferences,
        experienceLevel,
        profilePicture,
      },
    });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Error updating user' });
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
        latitude: { not: null },
        longitude: { not: null },
      },
      select: {
        id: true,
        username: true,
        location: true,
        latitude: true,
        longitude: true,
        gamePreferences: true,
        experienceLevel: true,
      },
    });
    const nearbyUsers = users.filter(user => {
      const distance = calculateDistance(latitude, longitude, user.latitude, user.longitude);
      return distance <= rad;
    });
    res.json(nearbyUsers);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching nearby users' });
  }
};