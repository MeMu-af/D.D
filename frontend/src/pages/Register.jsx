import { useState } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  Link,
  useToast,
  Container,
  Select
} from '@chakra-ui/react'
import { useAuth } from '../context/AuthContext'

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    firstName: '',
    lastName: '',
    location: '',
    age: '',
    experience: 'beginner'
  })
  const [isLoading, setIsLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await register(formData)
      toast({
        title: 'Registration successful',
        description: 'Please login with your credentials',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      navigate('/login')
    } catch (error) {
      toast({
        title: 'Registration failed',
        description: error.response?.data?.message || 'Please check your input',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container maxW="md" py={10}>
      <Box p={8} borderWidth={1} borderRadius="lg" boxShadow="lg">
        <VStack spacing={4} align="stretch">
          <Heading textAlign="center" color="purple.500">Join D&D Connect</Heading>
          <Text textAlign="center" color="gray.600">
            Create an account to connect with fellow adventurers
          </Text>

          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Username</FormLabel>
                <Input
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Choose a username"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>First Name</FormLabel>
                <Input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter your first name"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Last Name</FormLabel>
                <Input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter your last name"
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

              <Button
                type="submit"
                colorScheme="purple"
                width="full"
                isLoading={isLoading}
              >
                Register
              </Button>
            </VStack>
          </form>

          <Text textAlign="center">
            Already have an account?{' '}
            <Link as={RouterLink} to="/login" color="purple.500">
              Login
            </Link>
          </Text>
        </VStack>
      </Box>
    </Container>
  )
}

export default Register 