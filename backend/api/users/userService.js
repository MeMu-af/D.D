const prisma = require('../../prisma');

const getUserById = async (userId) => {
  const user = await prisma.user.findMany({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      firstName: true,
      lastName: true,
      profilePicture: true,
      bio: true,
      latitude: true,
      longitude: true,
      age: true,
      experience: true,
      createdAt: true
    }
  });
  return user ? formatUserProfilePicture(user) : null;
};

const updateUser = async (userId, updateData) => {
  try {
    console.log('Updating user in service layer:', {
      userId,
      updateData
    });

    // Validate userId
    if (!userId) {
      console.error('User ID is required');
      throw new Error('User ID is required');
    }

    // Whitelist allowed fields
    const allowedFields = {
      username: true,
      firstName: true,
      lastName: true,
      bio: true,
      location: true,
      age: true,
      experience: true,
      favoriteClasses: true
    };

    // Filter update data to only include allowed fields
    const sanitizedData = Object.keys(updateData).reduce((acc, key) => {
      if (allowedFields[key]) {
        acc[key] = updateData[key];
      }
      return acc;
    }, {});

    // If no valid fields to update
    if (Object.keys(sanitizedData).length === 0) {
      console.error('No valid fields to update');
      throw new Error('No valid fields to update');
    }

    console.log('Sanitized update data:', sanitizedData);

    // Verify user exists before update
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    });

    if (!existingUser) {
      console.error('User not found:', userId);
      throw new Error('User not found');
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: sanitizedData,
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        bio: true,
        location: true,
        age: true,
        experience: true,
        profilePicture: true,
        createdAt: true,
        updatedAt: true
      }
    });

    console.log('User updated successfully in service layer:', {
      userId: user.id,
      updatedFields: Object.keys(sanitizedData)
    });

    return formatUserProfilePicture(user);
  } catch (error) {
    console.error('Error in updateUser service:', {
      error: {
        name: error.name,
        message: error.message,
        code: error.code,
        stack: error.stack
      },
      userId,
      updateData
    });

    if (error.code === 'P2025') {
      throw new Error('User not found');
    }
    throw error;
  }
};

const deleteUser = async (userId) => {
  return await prisma.user.delete({
    where: { id: userId }
  });
};

const getUserPosts = async (userId) => {
  return await prisma.post.findMany({
    where: { userId: userId },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          profilePicture: true
        }
      },
      likes: true,
      comments: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              profilePicture: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

const formatUserProfilePicture = (user) => {
  if (user.profilePicture && !user.profilePicture.startsWith('http')) {
    user.profilePicture = `/api/v1${user.profilePicture}`;
  }
  return user;
};

const searchUsers = async (params = {}) => {
  console.log('Fetching all users...');
  
  // Get total count
  const total = await prisma.user.count();
  console.log('Total users found:', total);

  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      bio: true,
      location: true,
      state: true,
      city: true,
      experience: true,
      profilePicture: true,
      createdAt: true
    },
    orderBy: [
      { state: 'asc' },
      { city: 'asc' }
    ]
  });

  console.log('Found users:', users);

  // Format profile pictures
  const formattedUsers = users.map(user => formatUserProfilePicture(user));

  return {
    users: formattedUsers,
    pagination: {
      total,
      page: 1,
      limit: total,
      totalPages: 1
    }
  };
};

module.exports = {
  getUserById,
  updateUser,
  deleteUser,
  getUserPosts,
  searchUsers
}; 