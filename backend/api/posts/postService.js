const prisma = require('../../prisma');

const createPost = async (title, content, userId, media = null) => {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[${requestId}] Post service createPost started`);
  console.time(`[${requestId}] createPost`);
  
  try {
    console.log(`[${requestId}] Creating post with data:`, {
      title,
      content,
      userId,
      media
    });

    // Verify user exists before creating post
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    });

    if (!user) {
      console.log(`[${requestId}] User not found: ${userId}`);
      throw new Error('User not found');
    }

    // Validate media URL if provided
    if (media && typeof media !== 'string') {
      console.log(`[${requestId}] Invalid media type:`, typeof media);
      throw new Error('Media must be a string URL');
    }

    const result = await prisma.post.create({
      data: {
        title,
        content,
        media,
        userId
      },
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
        userId,
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

const getPostById = async (postId) => {
  return await prisma.post.findUnique({
    where: { id: postId },
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
      user: {
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
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[${requestId}] Like post service started for post ${postId} and user ${userId}`);
  console.time(`[${requestId}] likePost`);

  try {
    // Use a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // First check if the post exists and get it with all includes
      const post = await tx.post.findUnique({
        where: { id: postId },
        include: {
          user: {
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

      if (!post) {
        console.log(`[${requestId}] Post not found: ${postId}`);
        throw new Error('Post not found');
      }

      // Check if the user has already liked the post
      const existingLike = await tx.postLike.findUnique({
        where: {
          postId_userId: {
            postId,
            userId
          }
        }
      });

      if (existingLike) {
        console.log(`[${requestId}] Post already liked by user`);
        throw new Error('Post already liked by user');
      }

      // Create the like
      await tx.postLike.create({
        data: {
          postId,
          userId
        }
      });

      console.log(`[${requestId}] Like created successfully`);
      return post;
    });

    console.log(`[${requestId}] Like post service completed successfully`);
    console.timeEnd(`[${requestId}] likePost`);
    return result;
  } catch (error) {
    console.error(`[${requestId}] Error in likePost:`, {
      error: {
        message: error.message,
        stack: error.stack,
        code: error.code
      },
      data: {
        postId,
        userId
      }
    });
    console.timeEnd(`[${requestId}] likePost`);
    throw error;
  }
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
      user: {
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

const addComment = async (postId, content, userId) => {
  return await prisma.comment.create({
    data: {
      content,
      postId,
      userId
    },
    include: {
      user: {
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

const searchPosts = async (query) => {
  return await prisma.post.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } }
      ]
    },
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

const getUserPosts = async (userId) => {
  return await prisma.post.findMany({
    where: { userId },
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

module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  addComment,
  deleteComment,
  searchPosts,
  getUserPosts
}; 