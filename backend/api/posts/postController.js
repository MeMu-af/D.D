const postService = require('./postService');

exports.createPost = async (req, res) => {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[${requestId}] Create post request started`);
  console.time(`[${requestId}] createPostController`);
  
  try {
    const { title, content } = req.body;
    const media = req.file ? `/uploads/${req.file.filename}` : req.body.media;
    
    console.log(`[${requestId}] Request data:`, {
      title,
      content,
      media,
      user: req.user,
      headers: req.headers,
      contentType: req.headers['content-type'],
      body: req.body,
      rawBody: req.rawBody
    });

    if (!title || !content) {
      console.log(`[${requestId}] Missing required fields`);
      console.timeEnd(`[${requestId}] createPostController`);
      return res.status(400).json({ 
        success: false,
        error: 'Title and content are required',
        details: {
          title: !title ? 'Title is required' : undefined,
          content: !content ? 'Content is required' : undefined
        }
      });
    }

    if (!req.user?.id) {
      console.log(`[${requestId}] No user ID found in request`);
      console.timeEnd(`[${requestId}] createPostController`);
      return res.status(401).json({ 
        success: false,
        error: 'Unauthorized',
        details: 'User ID not found in request'
      });
    }

    console.log(`[${requestId}] Calling post service with media:`, media);
    const post = await postService.createPost(title, content, req.user.id, media);
    console.log(`[${requestId}] Post created:`, post);
    
    console.timeEnd(`[${requestId}] createPostController`);
    res.status(201).json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error(`[${requestId}] Error in createPostController:`, {
      error: {
        message: error.message,
        stack: error.stack,
        code: error.code
      }
    });
    console.timeEnd(`[${requestId}] createPostController`);
    
    if (error.message === 'User not found') {
      return res.status(404).json({
        error: 'User not found',
        message: 'The user who created this post could not be found'
      });
    }
    
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        error: 'Database error',
        details: 'A unique constraint was violated'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to create post',
      details: error.message
    });
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    const posts = await postService.getAllPosts();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching posts', details: error.message });
  }
};

exports.getPostById = async (req, res) => {
  try {
    const post = await postService.getPostById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching post', details: error.message });
  }
};

exports.updatePost = async (req, res) => {
  const { title, content } = req.body;
  const media = req.file ? `/uploads/${req.file.filename}` : null;
  try {
    const post = await postService.updatePost(req.params.id, title, content, media);
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Error updating post', details: error.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    await postService.deletePost(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error deleting post', details: error.message });
  }
};

exports.getUserPosts = async (req, res) => {
  const { userId } = req.params;
  try {
    const posts = await postService.getUserPosts(userId);
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user posts', details: error.message });
  }
};

exports.likePost = async (req, res) => {
  const { id } = req.params;
  try {
    const post = await postService.likePost(id, req.user.id);
    res.json(post);
  } catch (error) {
    if (error.message === 'Post not found') {
      return res.status(404).json({ 
        error: 'Post not found',
        details: 'The post you are trying to like does not exist'
      });
    }
    if (error.message === 'Post already liked by user') {
      return res.status(400).json({ 
        error: 'Post already liked',
        details: 'You have already liked this post'
      });
    }
    res.status(500).json({ 
      error: 'Error liking post', 
      details: error.message 
    });
  }
};

exports.unlikePost = async (req, res) => {
  const { id } = req.params;
  try {
    const post = await postService.unlikePost(id, req.user.id);
    res.json(post);
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
    const comment = await postService.addComment(id, content, req.user.id);
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Error adding comment', details: error.message });
  }
};

exports.deleteComment = async (req, res) => {
  const { id, commentId } = req.params;
  try {
    await postService.deleteComment(id, commentId);
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
    const posts = await postService.searchPosts(query);
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Error searching posts', details: error.message });
  }
};