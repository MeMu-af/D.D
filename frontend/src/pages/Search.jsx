import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Box,
  Container,
  VStack,
  Heading,
  Input,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  Card,
  CardBody,
  Text,
  Image,
  Flex,
  Avatar,
  Spinner,
  useToast
} from '@chakra-ui/react'
import { FaSearch } from 'react-icons/fa'
import axios from 'axios'

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('query') || '')
  const [posts, setPosts] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  useEffect(() => {
    if (query) {
      handleSearch()
    }
  }, [searchParams])

  const handleSearch = async () => {
    if (!query.trim()) return

    setLoading(true)
    try {
      const [postsResponse, usersResponse] = await Promise.all([
        axios.get(`/api/v1/posts/search?query=${query}`),
        axios.get(`/api/v1/users/search?query=${query}`)
      ])
      setPosts(postsResponse.data)
      setUsers(usersResponse.data)
    } catch (error) {
      toast({
        title: 'Error searching',
        description: error.response?.data?.message || 'Failed to perform search',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSearchParams({ query })
    handleSearch()
  }

  return (
    <Container maxW="1200px" py={10}>
      <VStack spacing={8}>
        <Box as="form" onSubmit={handleSubmit} w="full">
          <Flex gap={2}>
            <Input
              placeholder="Search for posts or users..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              size="lg"
            />
            <Box
              as="button"
              type="submit"
              bg="purple.500"
              color="white"
              p={4}
              borderRadius="md"
              _hover={{ bg: 'purple.600' }}
            >
              <FaSearch />
            </Box>
          </Flex>
        </Box>

        {loading ? (
          <Spinner size="xl" color="purple.500" />
        ) : (
          <Tabs w="full" variant="enclosed">
            <TabList>
              <Tab>Posts ({posts.length})</Tab>
              <Tab>Users ({users.length})</Tab>
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
                          <Flex align="center" gap={2}>
                            <Avatar size="sm" name={post.author?.username} />
                            <Text fontSize="sm" color="gray.500">
                              {post.author?.username}
                            </Text>
                          </Flex>
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
              </TabPanel>

              <TabPanel>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {users.map(user => (
                    <Card key={user.id}>
                      <CardBody>
                        <Flex align="center" gap={4}>
                          <Avatar size="lg" name={user.username} />
                          <VStack align="start" spacing={1}>
                            <Heading size="md">{user.username}</Heading>
                            <Text color="gray.500">{user.location}</Text>
                            <Text fontSize="sm">
                              Experience: {user.experience || 'Not specified'}
                            </Text>
                          </VStack>
                        </Flex>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
              </TabPanel>
            </TabPanels>
          </Tabs>
        )}
      </VStack>
    </Container>
  )
}

export default Search 