const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createPost = async (title, content, authorId, media = null) => {
  return await prisma.post.create({
    data: {
      title,
      content,
      media,
      authorId
    },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          profilePicture: true
        }
      }
    }
  });
};

const getAllPosts = async () => {
  return await prisma.post.findMany({
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

const getPostById = async (postId) => {
  return await prisma.post.findUnique({
    where: { id: postId },
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
    }
  });
};

const updatePost = async (postId, title, content, media = null) => {
  return await prisma.post.update({
    where: { id: postId },
    data: {
      title,
      content,
      media: media || undefined
    },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          profilePicture: true
        }
      }
    }
  });
};

const deletePost = async (postId) => {
  return await prisma.post.delete({
    where: { id: postId }
  });
};

module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost
}; 