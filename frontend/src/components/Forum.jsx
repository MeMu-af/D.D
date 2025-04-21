import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/card';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Textarea } from '@/components/ui/textarea';

function Forum() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ title: '', content: '', media: null });
  const [newComments, setNewComments] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('/api/posts');
        setPosts(response.data);
      } catch (err) {
        setError('Failed to fetch posts: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handlePostSubmit = async e => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', newPost.title);
    formData.append('content', newPost.content);
    if (newPost.media) formData.append('media', newPost.media);
    try {
      await axios.post('/api/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setNewPost({ title: '', content: '', media: null });
      const response = await axios.get('/api/posts');
      setPosts(response.data);
    } catch (err) {
      setError('Failed to create post: ' + err.message);
    }
  };

  const handleCommentSubmit = async (postId, e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('content', newComments[postId]?.content || '');
    if (newComments[postId]?.media) formData.append('media', newComments[postId].media);
    try {
      await axios.post(`/api/posts/${postId}/comments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setNewComments({ ...newComments, [postId]: { content: '', media: null } });
      const response = await axios.get('/api/posts');
      setPosts(response.data);
    } catch (err) {
      setError('Failed to create comment: ' + err.message);
    }
  };

  if (loading) return <div className="text-center text-gray-500">Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-4">D&D Forum</h1>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Create New Post</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Title"
              value={newPost.title}
              onChange={e => setNewPost({ ...newPost, title: e.target.value })}
            />
            <Textarea
              placeholder="Content"
              value={newPost.content}
              onChange={e => setNewPost({ ...newPost, content: e.target.value })}
            />
            <Input
              type="file"
              onChange={e => setNewPost({ ...newPost, media: e.target.files[0] })}
              accept="image/*,video/*"
            />
            <Button onClick={handlePostSubmit}>Post</Button>
          </div>
        </CardContent>
      </Card>
      {posts.map(post => (
        <Card key={post.id} className="mb-4">
          <CardHeader>
            <CardTitle>{post.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{post.content}</p>
            <p>By: {post.author.username}</p>
            {post.media && (
              <div className="mt-2">
                {post.media.endsWith('.mp4') || post.media.endsWith('.webm') ? (
                  <video controls className="w-full max-w-md">
                    <source src={post.media} type="video/mp4" />
                  </video>
                ) : (
                  <img src={post.media} alt="Post media" className="w-full max-w-md" />
                )}
              </div>
            )}
            <div className="mt-4">
              <h4 className="text-lg font-semibold">Comments</h4>
              {post.comments.map(comment => (
                <div key={comment.id} className="ml-4 mt-2">
                  <p>{comment.content}</p>
                  <p>By: {comment.author.username}</p>
                  {comment.media && (
                    <div className="mt-2">
                      {comment.media.endsWith('.mp4') || comment.media.endsWith('.webm') ? (
                        <video controls className="w-full max-w-sm">
                          <source src={comment.media} type="video/mp4" />
                        </video>
                      ) : (
                        <img src={comment.media} alt="Comment media" className="w-full max-w-sm" />
                      )}
                    </div>
                  )}
                </div>
              ))}
              <div className="ml-4 mt-2 space-y-2">
                <Textarea
                  placeholder="Add a comment"
                  value={newComments[post.id]?.content || ''}
                  onChange={e =>
                    setNewComments({
                      ...newComments,
                      [post.id]: { ...newComments[post.id], content: e.target.value },
                    })
                  }
                />
                <Input
                  type="file"
                  onChange={e =>
                    setNewComments({
                      ...newComments,
                      [post.id]: { ...newComments[post.id], media: e.target.files[0] },
                    })
                  }
                  accept="image/*,video/*"
                />
                <Button onClick={e => handleCommentSubmit(post.id, e)}>Comment</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default Forum;