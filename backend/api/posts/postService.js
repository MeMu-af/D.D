const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createPost = async (title, content, authorId, media = null) => {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[${requestId}] Post service createPost started`);
  console.time(`[${requestId}] createPost`);
  
  try {
    console.log(`[${requestId}] Creating post with data:`, {
      title,
      content,
      authorId,
      media
    });

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

    console.log(`[${requestId}] Post created successfully:`, result);
    console.timeEnd(`[${requestId}] createPost`);
    return result;
  } catch (error) {
    console.error(`[${requestId}] Error in createPost:`, {
      error: {
        message: error.message,
        stack: error.stack,
        code: error.code
      },
      data: {
        title,
        content,
        authorId,
        media
      }
    });
    console.timeEnd(`[${requestId}] createPost`);
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