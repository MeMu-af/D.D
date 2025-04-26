import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Avatar,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  Card,
  CardBody,
  Image,
  Flex,
  IconButton,
  useToast,
  Spinner,
  Badge
} from '@chakra-ui/react'
import { FaEdit, FaHeart, FaComment } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const Profile = () => {
  const { userId } = useParams()
  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const { user: currentUser } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  useEffect(() => {
    fetchUserData()
  }, [userId])

  const fetchUserData = async () => {
    try {
      const [userResponse, postsResponse] = await Promise.all([
        axios.get(`/api/v1/users/${userId}`),
        axios.get(`/api/v1/posts/user/${userId}`)
      ])
      setUser(userResponse.data)
      setPosts(postsResponse.data)
    } catch (error) {
      toast({
        title: 'Error fetching user data',
        description: error.response?.data?.message || 'Failed to load profile',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEditProfile = () => {
    navigate(`/profile/${userId}/edit`)
  }

  if (loading) {
    return (
      <Container maxW="1200px" py={10} centerContent>
        <Spinner size="xl" color="purple.500" />
      </Container>
    )
  }

  if (!user) {
    return (
      <Container maxW="1200px" py={10} centerContent>
        <Heading color="red.500">User not found</Heading>
      </Container>
    )
  }

  return (
    <Container maxW="1200px" py={10}>
      <VStack spacing={8}>
        {/* Profile Header */}
        <Box w="full" p={8} borderWidth={1} borderRadius="lg" boxShadow="md">
          <Flex justify="space-between" align="center" mb={6}>
            <HStack spacing={6}>
              <Avatar size="2xl" name={user.username} />
              <VStack align="start" spacing={1}>
                <Heading>{user.username}</Heading>
                <Text color="gray.500">{user.location || 'Location not specified'}</Text>
                <Badge colorScheme="purple" fontSize="sm">
                  {user.experience || 'Experience not specified'}
                </Badge>
              </VStack>
            </HStack>
            {currentUser?.id === user.id && (
              <Button
                leftIcon={<FaEdit />}
                colorScheme="purple"
                variant="outline"
                onClick={handleEditProfile}
              >
                Edit Profile
              </Button>
            )}
          </Flex>
          <Text>{user.bio || 'No bio available'}</Text>
        </Box>

        {/* Posts Section */}
        <Tabs w="full" variant="enclosed">
          <TabList>
            <Tab>Posts ({posts.length})</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
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
                        <Text noOfLines={3}>{post.content}</Text>
                        <Flex justify="space-between" w="full">
                          <Flex align="center" gap={2}>
                            <IconButton
                              icon={<FaHeart />}
                              colorScheme={post.isLiked ? 'red' : 'gray'}
                              variant="ghost"
                              size="sm"
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
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Container>
  )
}

export default Profile 