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
  Container
} from '@chakra-ui/react'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await login(email, password)
      toast({
        title: 'Login successful',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      navigate('/')
    } catch (error) {
      toast({
        title: 'Login failed',
        description: error.response?.data?.message || 'Invalid credentials',
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
          <Heading textAlign="center" color="purple.500">Welcome Back!</Heading>
          <Text textAlign="center" color="gray.600">
            Login to connect with fellow D&D enthusiasts
          </Text>

          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
              </FormControl>

              <Button
                type="submit"
                colorScheme="purple"
                width="full"
                isLoading={isLoading}
              >
                Login
              </Button>
            </VStack>
          </form>

          <Text textAlign="center">
            Don't have an account?{' '}
            <Link as={RouterLink} to="/register" color="purple.500">
              Register
            </Link>
          </Text>
        </VStack>
      </Box>
    </Container>
  )
}

export default Login 