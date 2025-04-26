import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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
  Select,
  useToast,
  Avatar,
  IconButton,
  Flex
} from '@chakra-ui/react'
import { FaTimes } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const EditProfile = () => {
  const { userId } = useParams()
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    location: '',
    age: '',
    experience: '',
    bio: ''
  })
  const [avatar, setAvatar] = useState(null)
  const [preview, setPreview] = useState('')
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user: currentUser } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  useEffect(() => {
    if (currentUser?.id !== userId) {
      navigate('/')
      return
    }
    fetchUserData()
  }, [userId, currentUser])

  const fetchUserData = async () => {
    try {
      const response = await axios.get(`/api/v1/users/${userId}`)
      setFormData({
        username: response.data.username || '',
        firstName: response.data.firstName || '',
        lastName: response.data.lastName || '',
        location: response.data.location || '',
        age: response.data.age || '',
        experience: response.data.experience || 'beginner',
        bio: response.data.bio || ''
      })
      setPreview(response.data.avatar || '')
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

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatar(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const removeImage = () => {
    setAvatar(null)
    setPreview('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formDataToSend = new FormData()
    Object.entries(formData).forEach(([key, value]) => {
      if (value) formDataToSend.append(key, value)
    })
    if (avatar) {
      formDataToSend.append('avatar', avatar)
    }

    try {
      await axios.put(`/api/v1/users/${userId}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      toast({
        title: 'Profile updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      navigate(`/profile/${userId}`)
    } catch (error) {
      toast({
        title: 'Error updating profile',
        description: error.response?.data?.message || 'Failed to update profile',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return null
  }

  return (
    <Container maxW="800px" py={10}>
      <VStack spacing={8}>
        <Heading color="purple.500">Edit Profile</Heading>

        <Box as="form" onSubmit={handleSubmit} w="full">
          <VStack spacing={6}>
            <FormControl>
              <FormLabel>Profile Picture</FormLabel>
              <Flex direction="column" align="center" gap={4}>
                <Avatar
                  size="2xl"
                  src={preview}
                  name={formData.username}
                />
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  p={1}
                />
                {preview && (
                  <IconButton
                    icon={<FaTimes />}
                    colorScheme="red"
                    variant="ghost"
                    onClick={removeImage}
                    aria-label="Remove image"
                  />
                )}
              </Flex>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Username</FormLabel>
              <Input
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter username"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>First Name</FormLabel>
              <Input
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter first name"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Last Name</FormLabel>
              <Input
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter last name"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Location</FormLabel>
              <Input
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter your location"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Age</FormLabel>
              <Input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="Enter your age"
              />
            </FormControl>

            <FormControl>
              <FormLabel>D&D Experience</FormLabel>
              <Select
                name="experience"
                value={formData.experience}
                onChange={handleChange}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Bio</FormLabel>
              <Textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself..."
                rows={4}
              />
            </FormControl>

            <Flex justify="flex-end" w="full" gap={4}>
              <Button
                variant="outline"
                onClick={() => navigate(`/profile/${userId}`)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                colorScheme="purple"
                isLoading={isSubmitting}
                loadingText="Saving..."
              >
                Save Changes
              </Button>
            </Flex>
          </VStack>
        </Box>
      </VStack>
    </Container>
  )
}

export default EditProfile 