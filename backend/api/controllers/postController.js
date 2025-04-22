const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createPost = async (req, res) => {
  const { title, content } = req.body;
  const media = req.file ? `/uploads/${req.file.filename}` : null;
  try {
    const post = await prisma.post.create({
      data: {
        title,
        content,
        media,
        authorId: req.user.userId
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
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: 'Error creating post', details: error.message });
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
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
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching posts', details: error.message });
  }
};

exports.getPostById = async (req, res) => {
  const { id } = req.params;
  try {
    const post = await prisma.post.findUnique({
      where: { id },
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
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching post', details: error.message });
  }
};

exports.updatePost = async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  const media = req.file ? `/uploads/${req.file.filename}` : undefined;
  
  try {
    const post = await prisma.post.findUnique({
      where: { id }
    });
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    if (post.authorId !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to update this post' });
    }
    
    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        title,
        content,
        media
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
    
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ error: 'Error updating post', details: error.message });
  }
};

exports.deletePost = async (req, res) => {
  const { id } = req.params;
  try {
    const post = await prisma.post.findUnique({
      where: { id }
    });
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    if (post.authorId !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }
    
    await prisma.post.delete({
      where: { id }
    });
    
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting post', details: error.message });
  }
};

exports.getUserPosts = async (req, res) => {
  const { userId } = req.params;
  try {
    const posts = await prisma.post.findMany({
      where: {
        authorId: userId
      },
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
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user posts', details: error.message });
  }
};

exports.likePost = async (req, res) => {
  const { id } = req.params;
  try {
    const post = await prisma.post.findUnique({
      where: { id }
    });
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const existingLike = await prisma.like.findFirst({
      where: {
        postId: id,
        userId: req.user.userId
      }
    });
    
    if (existingLike) {
      return res.status(400).json({ error: 'Post already liked' });
    }
    
    await prisma.like.create({
      data: {
        postId: id,
        userId: req.user.userId
      }
    });
    
    res.json({ message: 'Post liked successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error liking post', details: error.message });
  }
};

exports.unlikePost = async (req, res) => {
  const { id } = req.params;
  try {
    const like = await prisma.like.findFirst({
      where: {
        postId: id,
        userId: req.user.userId
      }
    });
    
    if (!like) {
      return res.status(404).json({ error: 'Like not found' });
    }
    
    await prisma.like.delete({
      where: { id: like.id }
    });
    
    res.json({ message: 'Post unliked successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error unliking post', details: error.message });
  }
};

exports.addComment = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  
  if (!content) {
    return res.status(400).json({ error: 'Comment content is required' });
  }
  
  try {
    const post = await prisma.post.findUnique({
      where: { id }
    });
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const comment = await prisma.comment.create({
      data: {
        content,
        postId: id,
        authorId: req.user.userId
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
    
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Error adding comment', details: error.message });
  }
};

exports.deleteComment = async (req, res) => {
  const { id, commentId } = req.params;
  try {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId }
    });
    
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    if (comment.authorId !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }
    
    await prisma.comment.delete({
      where: { id: commentId }
    });
    
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting comment', details: error.message });
  }
};

exports.searchPosts = async (req, res) => {
  const { query } = req.query;
  
  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }
  
  try {
    const posts = await prisma.post.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } }
        ]
      },
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
    
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Error searching posts', details: error.message });
  }
};