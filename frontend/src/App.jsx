import { Box, Container, Heading, Text, VStack } from '@chakra-ui/react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'

function App() {
  return (
    <Router>
      <Box minH="100vh" bg="dnd.dungeonGray">
        <Navbar />
        <Container maxW="container.xl" py={8}>
          <Routes>
            <Route path="/" element={
              <VStack spacing={8} align="center" py={12}>
                <Heading 
                  as="h1" 
                  size="2xl" 
                  color="dnd.gold"
                  fontFamily="heading"
                  textAlign="center"
                >
                  Welcome to Dragon's Dream
                </Heading>
                <Text 
                  fontSize="xl" 
                  color="dnd.parchment"
                  textAlign="center"
                  maxW="2xl"
                >
                  Your epic journey begins here. Manage your campaigns, create characters, 
                  and forge legends that will be told for generations.
                </Text>
              </VStack>
            } />
          </Routes>
        </Container>
      </Box>
    </Router>
  )
}

export default App 