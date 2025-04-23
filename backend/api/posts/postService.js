const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createPost = async (title, content, authorId, media = null) => {
  console.time('createPost');
  try {
    const result = await prisma.post.create({
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
    console.timeEnd('createPost');
    return result;
  } catch (error) {
    console.error('Error in createPost:', error);
    throw error;
  }
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

const likePost = async (postId, userId) => {
  return await prisma.post.update({
    where: { id: postId },
    data: {
      likes: {
        create: {
          userId
        }
      }
    },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          profilePicture: true
        }
      },
      likes: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              profilePicture: true
            }
          }
        }
      },
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
    }
  });
};

const unlikePost = async (postId, userId) => {
  await prisma.postLike.deleteMany({
    where: {
      postId,
      userId
    }
  });

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
      likes: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              profilePicture: true
            }
          }
        }
      },
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
    }
  });
};

const addComment = async (postId, content, authorId) => {
  return await prisma.comment.create({
    data: {
      content,
      postId,
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

const deleteComment = async (postId, commentId) => {
  return await prisma.comment.delete({
    where: {
      id: commentId,
      postId
    }
  });
};

module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  addComment,
  deleteComment
}; 