import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  useToast,
  Image,
  IconButton,
  Flex
} from '@chakra-ui/react'
import { FaTimes } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const CreatePost = () => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const removeImage = () => {
    setImage(null)
    setPreview('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData()
    formData.append('title', title)
    formData.append('content', content)
    if (image) {
      formData.append('image', image)
    }

    try {
      await axios.post('/api/v1/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      toast({
        title: 'Post created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      navigate('/posts')
    } catch (error) {
      toast({
        title: 'Error creating post',
        description: error.response?.data?.message || 'Failed to create post',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    navigate('/login')
    return null
  }

  return (
    <Container maxW="800px" py={10}>
      <VStack spacing={8}>
        <Heading color="purple.500">Create a New Post</Heading>

        <Box as="form" onSubmit={handleSubmit} w="full">
          <VStack spacing={6}>
            <FormControl isRequired>
              <FormLabel>Title</FormLabel>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter post title"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Content</FormLabel>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your D&D story, tips, or questions..."
                rows={6}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Image (Optional)</FormLabel>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                p={1}
              />
            </FormControl>

            {preview && (
              <Box position="relative" w="full">
                <Image
                  src={preview}
                  alt="Preview"
                  borderRadius="lg"
                  maxH="300px"
                  objectFit="cover"
                />
                <IconButton
                  icon={<FaTimes />}
                  position="absolute"
                  top={2}
                  right={2}
                  colorScheme="red"
                  onClick={removeImage}
                  aria-label="Remove image"
                />
              </Box>
            )}

            <Flex justify="flex-end" w="full">
              <Button
                type="submit"
                colorScheme="purple"
                isLoading={isLoading}
                loadingText="Creating..."
              >
                Create Post
              </Button>
            </Flex>
          </VStack>
        </Box>
      </VStack>
    </Container>
  )
}

export default CreatePost 