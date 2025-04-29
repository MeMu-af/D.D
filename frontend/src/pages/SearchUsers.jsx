import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Avatar,
  useToast,
  Spinner,
  Link,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

function SearchUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/v1/users/nearby');
        const data = await response.json();
        
        if (response.ok) {
          setUsers(data);
        } else {
          throw new Error(data.message || 'Failed to fetch users');
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [toast]);

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={6} align="stretch">
        <Text fontSize="2xl" fontWeight="bold" color="dnd.parchment">
          Nearby Users
        </Text>

        {loading ? (
          <Box textAlign="center" py={8}>
            <Spinner size="xl" color="dnd.gold" />
          </Box>
        ) : users.length === 0 ? (
          <Box textAlign="center" py={8}>
            <Text color="dnd.parchment">No users found nearby.</Text>
          </Box>
        ) : (
          <VStack spacing={4} align="stretch">
            {users.map((otherUser) => (
              <Link
                key={otherUser.id}
                as={RouterLink}
                to={`/profile/${otherUser.id}`}
                _hover={{ textDecoration: 'none' }}
              >
                <Box
                  p={4}
                  bg="white"
                  borderRadius="md"
                  boxShadow="sm"
                  _hover={{ transform: 'translateY(-2px)', transition: 'transform 0.2s' }}
                >
                  <HStack spacing={4}>
                    <Avatar
                      size="md"
                      name={otherUser.username}
                      src={otherUser.profilePicture}
                      bg="dnd.gold"
                      color="dnd.dungeonGray"
                    />
                    <VStack align="start" spacing={1} flex={1}>
                      <Text fontWeight="bold" color="dnd.dungeonGray">
                        {otherUser.username}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {otherUser.location}
                      </Text>
                      <Text fontSize="sm" color="dnd.gold">
                        {otherUser.distance ? `${otherUser.distance.toFixed(1)} miles away` : 'Distance unknown'}
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              </Link>
            ))}
          </VStack>
        )}
      </VStack>
    </Container>
  );
}

export default SearchUsers; 