import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Image,
  Flex,
  IconButton,
  Button,
  Textarea,
  useToast,
  Divider,
  Avatar,
  Spinner
} from '@chakra-ui/react'
import { FaHeart, FaTrash, FaEdit } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const PostDetail = () => {
  const { postId } = useParams()
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  useEffect(() => {
    fetchPost()
  }, [postId])

  const fetchPost = async () => {
    try {
      const response = await axios.get(`/api/v1/posts/${postId}`)
      setPost(response.data)
      setComments(response.data.comments || [])
    } catch (error) {
      toast({
        title: 'Error fetching post',
        description: error.response?.data?.message || 'Failed to load post',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async () => {
    try {
      await axios.post(`/api/v1/posts/${postId}/like`)
      setPost(prev => ({
        ...prev,
        likes: prev.likes + 1,
        isLiked: true
      }))
    } catch (error) {
      toast({
        title: 'Error liking post',
        description: error.response?.data?.message || 'Failed to like post',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleUnlike = async () => {
    try {
      await axios.delete(`/api/v1/posts/${postId}/like`)
      setPost(prev => ({
        ...prev,
        likes: prev.likes - 1,
        isLiked: false
      }))
    } catch (error) {
      toast({
        title: 'Error unliking post',
        description: error.response?.data?.message || 'Failed to unlike post',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleComment = async () => {
    if (!newComment.trim()) return

    try {
      const response = await axios.post(`/api/v1/posts/${postId}/comments`, {
        content: newComment
      })
      setComments([...comments, response.data])
      setNewComment('')
    } catch (error) {
      toast({
        title: 'Error adding comment',
        description: error.response?.data?.message || 'Failed to add comment',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(`/api/v1/posts/${postId}/comments/${commentId}`)
      setComments(comments.filter(comment => comment.id !== commentId))
    } catch (error) {
      toast({
        title: 'Error deleting comment',
        description: error.response?.data?.message || 'Failed to delete comment',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleDeletePost = async () => {
    try {
      await axios.delete(`/api/v1/posts/${postId}`)
      toast({
        title: 'Post deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      navigate('/posts')
    } catch (error) {
      toast({
        title: 'Error deleting post',
        description: error.response?.data?.message || 'Failed to delete post',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  if (loading) {
    return (
      <Container maxW="800px" py={10} centerContent>
        <Spinner size="xl" color="purple.500" />
      </Container>
    )
  }

  if (!post) {
    return (
      <Container maxW="800px" py={10} centerContent>
        <Heading color="red.500">Post not found</Heading>
      </Container>
    )
  }

  return (
    <Container maxW="800px" py={10}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading color="purple.500">{post.title}</Heading>
          <Text color="gray.500" mt={2}>
            Posted by {post.author?.username} on {new Date(post.createdAt).toLocaleDateString()}
          </Text>
        </Box>

        {post.image && (
          <Image
            src={post.image}
            alt={post.title}
            borderRadius="lg"
            maxH="400px"
            objectFit="cover"
          />
        )}

        <Text fontSize="lg">{post.content}</Text>

        <Flex align="center" gap={4}>
          <Flex align="center" gap={2}>
            <IconButton
              icon={<FaHeart />}
              colorScheme={post.isLiked ? 'red' : 'gray'}
              variant="ghost"
              onClick={post.isLiked ? handleUnlike : handleLike}
              aria-label="Like post"
            />
            <Text>{post.likes}</Text>
          </Flex>

          {user?.id === post.author?.id && (
            <Flex gap={2}>
              <Button
                leftIcon={<FaEdit />}
                colorScheme="purple"
                variant="outline"
                onClick={() => navigate(`/posts/${postId}/edit`)}
              >
                Edit
              </Button>
              <Button
                leftIcon={<FaTrash />}
                colorScheme="red"
                variant="outline"
                onClick={handleDeletePost}
              >
                Delete
              </Button>
            </Flex>
          )}
        </Flex>

        <Divider />

        <Box>
          <Heading size="md" mb={4}>Comments</Heading>
          <VStack spacing={4} align="stretch">
            {comments.map(comment => (
              <Box key={comment.id} p={4} borderWidth={1} borderRadius="lg">
                <Flex justify="space-between" align="center" mb={2}>
                  <Flex align="center" gap={2}>
                    <Avatar size="sm" name={comment.author?.username} />
                    <Text fontWeight="bold">{comment.author?.username}</Text>
                  </Flex>
                  {user?.id === comment.author?.id && (
                    <IconButton
                      icon={<FaTrash />}
                      size="sm"
                      colorScheme="red"
                      variant="ghost"
                      onClick={() => handleDeleteComment(comment.id)}
                      aria-label="Delete comment"
                    />
                  )}
                </Flex>
                <Text>{comment.content}</Text>
                <Text fontSize="sm" color="gray.500" mt={2}>
                  {new Date(comment.createdAt).toLocaleDateString()}
                </Text>
              </Box>
            ))}
          </VStack>

          {user && (
            <Box mt={6}>
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                mb={2}
              />
              <Button
                colorScheme="purple"
                onClick={handleComment}
                isDisabled={!newComment.trim()}
              >
                Add Comment
              </Button>
            </Box>
          )}
        </Box>
      </VStack>
    </Container>
  )
}

export default PostDetail 