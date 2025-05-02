import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Card,
  CardBody,
  useColorModeValue,
} from '@chakra-ui/react';

function Home() {
  const bgColor = useColorModeValue('dnd.dungeonGray', 'dnd.dungeonGray');
  const textColor = useColorModeValue('dnd.parchment', 'dnd.parchment');
  const cardBg = useColorModeValue('dnd.darkGray', 'dnd.darkGray');

  return (
    <Box minH="100vh" bg={bgColor} py={8}>
      <Container maxW="container.xl">
        <Card bg={cardBg} color={textColor}>
          <CardBody>
            <VStack spacing={8} align="start">
              <Heading
                as="h1"
                size="2xl"
                color="dnd.gold"
                fontFamily="heading"
                lineHeight="1.2"
              >
                D&D Connect
              </Heading>
              <Text
                fontSize="xl"
                color="dnd.parchment"
                maxW="2xl"
              >
                Find fellow adventurers in your area and bring your campaigns to life! Upload highlight reels and pictures of your campaigns, art, collections, and more in our forum for everything D&D!  Virtual play coming soon...
              </Text>
            </VStack>
          </CardBody>
        </Card>
      </Container>
    </Box>
  );
}

export default Home; 