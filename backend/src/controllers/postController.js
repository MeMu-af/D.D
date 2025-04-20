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
        authorId: req.user.userId, // from auth middleware
      },
    });
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: 'Error creating post' });
  }
};

exports.getPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: { select: { username: true } },
        comments: {
          include: { author: { select: { username: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.createComment = async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;
  const media = req.file ? `/uploads/${req.file.filename}` : null;
  try {
    const comment = await prisma.comment.create({
      data: {
        content,
        media,
        authorId: req.user.userId,
        postId: parseInt(postId),
      },
    });
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Error creating comment' });
  }
};