import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  VStack,
  Heading,
  Button,
  SimpleGrid,
  Card,
  CardBody,
  Text,
  Image,
  Flex,
  IconButton,
  useToast,
  Spinner
} from '@chakra-ui/react'
import { FaHeart, FaComment, FaPlus } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const Posts = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await axios.get('/api/v1/posts')
      setPosts(response.data)
    } catch (error) {
      toast({
        title: 'Error fetching posts',
        description: error.response?.data?.message || 'Failed to load posts',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (postId) => {
    try {
      await axios.post(`/api/v1/posts/${postId}/like`)
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            likes: post.likes + 1,
            isLiked: true
          }
        }
        return post
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

  const handleUnlike = async (postId) => {
    try {
      await axios.delete(`/api/v1/posts/${postId}/like`)
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            likes: post.likes - 1,
            isLiked: false
          }
        }
        return post
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

  if (loading) {
    return (
      <Container maxW="1200px" py={10} centerContent>
        <Spinner size="xl" color="purple.500" />
      </Container>
    )
  }

  return (
    <Container maxW="1200px" py={10}>
      <VStack spacing={8}>
        <Flex justify="space-between" w="full" align="center">
          <Heading color="purple.500">Community Posts</Heading>
          {user && (
            <Button
              leftIcon={<FaPlus />}
              colorScheme="purple"
              onClick={() => navigate('/posts/create')}
            >
              Create Post
            </Button>
          )}
        </Flex>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} w="full">
          {posts.map(post => (
            <Card key={post.id} overflow="hidden">
              {post.image && (
                <Image
                  src={post.image}
                  alt={post.title}
                  height="200px"
                  objectFit="cover"
                />
              )}
              <CardBody>
                <VStack align="start" spacing={4}>
                  <Heading size="md">{post.title}</Heading>
                  <Text>{post.content}</Text>
                  <Flex justify="space-between" w="full">
                    <Flex align="center" gap={2}>
                      <IconButton
                        icon={<FaHeart />}
                        colorScheme={post.isLiked ? 'red' : 'gray'}
                        variant="ghost"
                        onClick={() => post.isLiked ? handleUnlike(post.id) : handleLike(post.id)}
                      />
                      <Text>{post.likes}</Text>
                    </Flex>
                    <Flex align="center" gap={2}>
                      <FaComment />
                      <Text>{post.comments?.length || 0}</Text>
                    </Flex>
                  </Flex>
                  <Button
                    variant="link"
                    colorScheme="purple"
                    onClick={() => navigate(`/posts/${post.id}`)}
                  >
                    View Details
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      </VStack>
    </Container>
  )
}

export default Posts 