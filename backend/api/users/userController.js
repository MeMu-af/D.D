const prisma = require('../../prisma');
const userService = require('./userService');
const authService = require('../auth/authService');

// Location utility functions
const EARTH_RADIUS_KM = 6371;

const toRadians = (degrees) => {
    return degrees * (Math.PI / 180);
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return EARTH_RADIUS_KM * c;
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
    const user = await userService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user profile', details: error.message });
  }
};

exports.updateUserProfile = async (req, res, next) => {
  try {
    console.log('Update profile request received:', {
      userId: req.params.id,
      authenticatedUserId: req.user?.userId,
      updateData: req.body,
      headers: {
        authorization: req.headers.authorization ? 'Bearer [REDACTED]' : undefined,
        'content-type': req.headers['content-type']
      }
    });

    if (!req.user) {
      console.error('No authenticated user found');
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.params.id !== req.user.userId) {
      console.error('User ID mismatch:', {
        requestedUserId: req.params.id,
        authenticatedUserId: req.user.userId
      });
      return res.status(403).json({ error: 'Cannot update another user\'s profile' });
    }

    // Verify user exists before update
    const existingUser = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: { id: true }
    });

    if (!existingUser) {
      console.error('User not found:', req.params.id);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('Updating user profile:', {
      userId: req.params.id,
      updateData: req.body
    });

    const updatedUser = await userService.updateUser(req.params.id, req.body);
    
    console.log('User profile updated successfully:', {
      userId: updatedUser.id,
      updatedFields: Object.keys(req.body)
    });

    return res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user profile:', {
      error: {
        name: error.name,
        message: error.message,
        code: error.code,
        stack: error.stack
      },
      userId: req.params.id
    });
    
    if (error.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }

    if (error.message === 'No valid fields to update') {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    next(error);
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
  try {
    console.log('Profile picture upload request received:', {
      userId: req.params.id,
      authenticatedUserId: req.user?.userId,
      hasFile: !!req.file,
      headers: {
        authorization: req.headers.authorization ? 'Bearer [REDACTED]' : undefined,
        'content-type': req.headers['content-type']
      }
    });

    if (!req.user) {
      console.error('No authenticated user found');
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;
    if (id !== req.user.userId) {
      console.error('User ID mismatch:', {
        requestedUserId: id,
        authenticatedUserId: req.user.userId
      });
      return res.status(403).json({ error: 'You can only update your own profile picture' });
    }

    if (!req.file) {
      console.error('No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Get the subdirectory (images or videos) from the file path
    const subdir = req.file.mimetype.startsWith('image/') ? 'images' : 'videos';
    const profilePicturePath = `/uploads/${subdir}/${req.file.filename}`;
    const fullProfilePictureUrl = `/api/v1${profilePicturePath}`;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        profilePicture: fullProfilePictureUrl
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

    console.log('Profile picture updated successfully:', {
      userId: updatedUser.id,
      profilePicture: updatedUser.profilePicture
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile picture:', {
      error: {
        name: error.name,
        message: error.message,
        code: error.code,
        stack: error.stack
      },
      userId: req.params.id
    });
    res.status(500).json({ error: 'Error updating profile picture', details: error.message });
  }
};

exports.getNearbyUsers = async (req, res) => {
    try {
        // Get the current user's location
        const currentUser = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: {
                latitude: true,
                longitude: true
            }
        });

        if (!currentUser || !currentUser.latitude || !currentUser.longitude) {
            return res.status(400).json({ error: 'User location not set' });
        }

        // Get all users with their locations
        const users = await prisma.user.findMany({
            where: {
                id: { not: req.user.userId },
                latitude: { not: null },
                longitude: { not: null }
            },
            select: {
                id: true,
                username: true,
                location: true,
                latitude: true,
                longitude: true,
                profilePicture: true,
                experience: true,
                favoriteClasses: true
            }
        });

        // Calculate distance for each user and convert to miles
        const usersWithDistance = users.map(user => {
            const distanceInKm = calculateDistance(
                currentUser.latitude,
                currentUser.longitude,
                user.latitude,
                user.longitude
            );
            const distanceInMiles = distanceInKm * 0.621371; // Convert km to miles

            return {
                ...user,
                distance: distanceInMiles
            };
        });

        // Sort users by distance
        usersWithDistance.sort((a, b) => a.distance - b.distance);

        res.json(usersWithDistance);
    } catch (error) {
        console.error('Error fetching nearby users:', error);
        res.status(500).json({ error: 'Error fetching nearby users', details: error.message });
    }
};

exports.updateUserLocation = async (req, res) => {
    const { latitude, longitude, location } = req.body;
    
    // Validate required fields
    if (!location) {
        return res.status(400).json({ error: 'Location name is required' });
    }
    if (!latitude || !longitude) {
        return res.status(400).json({ error: 'Both latitude and longitude are required' });
    }

    try {
        const updatedUser = await prisma.user.update({
            where: { id: req.user.userId },
            data: {
                location,
                latitude,
                longitude,
                lastLocationUpdate: new Date()
            }
        });
        res.json(updatedUser);
    } catch (error) {
        console.error('Error updating user location:', error);
        res.status(500).json({ error: 'Error updating user location', details: error.message });
    }
};

exports.searchUsers = async (req, res) => {
  try {
    console.log('Search request query:', req.query);
    const result = await userService.searchUsers(req.query);
    console.log('Search result:', result);
    res.json(result);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};