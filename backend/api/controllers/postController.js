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