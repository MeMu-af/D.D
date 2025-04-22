const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getUserById = async (userId) => {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      profilePicture: true,
      bio: true,
      location: true,
      latitude: true,
      longitude: true,
      age: true,
      experience: true,
      createdAt: true
    }
  });
};

const updateUser = async (userId, updateData) => {
  return await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      username: true,
      email: true,
      profilePicture: true,
      bio: true,
      location: true,
      latitude: true,
      longitude: true,
      age: true,
      experience: true,
      createdAt: true
    }
  });
};

const deleteUser = async (userId) => {
  return await prisma.user.delete({
    where: { id: userId }
  });
};

const getUserPosts = async (userId) => {
  return await prisma.post.findMany({
    where: { authorId: userId },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          profilePicture: true
        }
      },
      likes: true,
      comments: {
        include: {
          author: {
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

module.exports = {
  getUserById,
  updateUser,
  deleteUser,
  getUserPosts
}; 