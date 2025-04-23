const postService = require('./postService');

exports.createPost = async (req, res) => {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[${requestId}] Create post request started`);
  console.time(`[${requestId}] createPostController`);
  
  try {
    const { title, content } = req.body;
    console.log(`[${requestId}] Request data:`, {
      title,
      content,
      user: req.user,
      headers: req.headers,
      contentType: req.headers['content-type']
    });

    if (!title || !content) {
      console.log(`[${requestId}] Missing required fields`);
      console.timeEnd(`[${requestId}] createPostController`);
      return res.status(400).json({ error: 'Title and content are required' });
    }

    if (!req.user?.userId) {
      console.log(`[${requestId}] No user ID found in request`);
      console.timeEnd(`[${requestId}] createPostController`);
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log(`[${requestId}] Calling post service`);
    const post = await postService.createPost(title, content, req.user.userId);
    console.log(`[${requestId}] Post created:`, post);
    
    console.timeEnd(`[${requestId}] createPostController`);
    res.status(201).json(post);
  } catch (error) {
    console.error(`[${requestId}] Error in createPostController:`, {
      error: {
        message: error.message,
        stack: error.stack
      }
    });
    console.timeEnd(`[${requestId}] createPostController`);
    res.status(500).json({ error: 'Failed to create post' });
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
    const post = await postService.likePost(id, req.user.userId);
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Error liking post', details: error.message });
  }
};

exports.unlikePost = async (req, res) => {
  const { id } = req.params;
  try {
    const post = await postService.unlikePost(id, req.user.userId);
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
    const comment = await postService.addComment(id, content, req.user.userId);
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