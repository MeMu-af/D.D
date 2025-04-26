import { Box, Container, Heading, Text, Button, VStack, SimpleGrid, Image, useColorModeValue } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { FaDice, FaUsers, FaComments } from 'react-icons/fa'

const Home = () => {
  const bg = useColorModeValue('white', 'gray.800')
  const cardBg = useColorModeValue('gray.50', 'gray.700')

  const features = [
    {
      icon: <FaDice size="40px" color="#805AD5" />,
      title: 'Find Players',
      description: 'Connect with D&D enthusiasts in your area and form new adventuring parties.'
    },
    {
      icon: <FaUsers size="40px" color="#805AD5" />,
      title: 'Join Groups',
      description: 'Discover local gaming groups and find the perfect campaign to join.'
    },
    {
      icon: <FaComments size="40px" color="#805AD5" />,
      title: 'Share Stories',
      description: 'Share your D&D experiences, tips, and memorable moments with the community.'
    }
  ]

  return (
    <Box>
      {/* Hero Section */}
      <Box bg={bg} py={20}>
        <Container maxW="1200px">
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10} alignItems="center">
            <VStack spacing={6} align="start">
              <Heading size="2xl" color="purple.500">
                Connect with Fellow Adventurers
              </Heading>
              <Text fontSize="xl" color="gray.600">
                Find your perfect D&D group, share your stories, and embark on epic adventures together.
              </Text>
              <Button
                as={RouterLink}
                to="/register"
                size="lg"
                colorScheme="purple"
                leftIcon={<FaDice />}
              >
                Join the Adventure
              </Button>
            </VStack>
            <Box>
              <Image
                src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                alt="D&D Adventure"
                borderRadius="lg"
                boxShadow="xl"
              />
            </Box>
          </SimpleGrid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box py={20} bg={cardBg}>
        <Container maxW="1200px">
          <VStack spacing={12}>
            <Heading textAlign="center" color="purple.500">
              Why Join D&D Connect?
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
              {features.map((feature, index) => (
                <Box
                  key={index}
                  p={8}
                  bg={bg}
                  borderRadius="lg"
                  boxShadow="md"
                  textAlign="center"
                >
                  <Box mb={4}>{feature.icon}</Box>
                  <Heading size="md" mb={2}>
                    {feature.title}
                  </Heading>
                  <Text color="gray.600">{feature.description}</Text>
                </Box>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Call to Action */}
      <Box py={20} bg={bg}>
        <Container maxW="1200px" textAlign="center">
          <VStack spacing={6}>
            <Heading color="purple.500">Ready to Begin Your Journey?</Heading>
            <Text fontSize="xl" color="gray.600">
              Join our community of D&D enthusiasts and start your next adventure today.
            </Text>
            <Button
              as={RouterLink}
              to="/register"
              size="lg"
              colorScheme="purple"
              leftIcon={<FaDice />}
            >
              Get Started
            </Button>
          </VStack>
        </Container>
      </Box>
    </Box>
  )
}

export default Home 