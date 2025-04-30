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
import { userService } from '../api/services';

const US_STATES = [
  { name: 'Alabama', abbreviation: 'AL' },
  { name: 'Alaska', abbreviation: 'AK' },
  { name: 'Arizona', abbreviation: 'AZ' },
  { name: 'Arkansas', abbreviation: 'AR' },
  { name: 'California', abbreviation: 'CA' },
  { name: 'Colorado', abbreviation: 'CO' },
  { name: 'Connecticut', abbreviation: 'CT' },
  { name: 'Delaware', abbreviation: 'DE' },
  { name: 'Florida', abbreviation: 'FL' },
  { name: 'Georgia', abbreviation: 'GA' },
  { name: 'Hawaii', abbreviation: 'HI' },
  { name: 'Idaho', abbreviation: 'ID' },
  { name: 'Illinois', abbreviation: 'IL' },
  { name: 'Indiana', abbreviation: 'IN' },
  { name: 'Iowa', abbreviation: 'IA' },
  { name: 'Kansas', abbreviation: 'KS' },
  { name: 'Kentucky', abbreviation: 'KY' },
  { name: 'Louisiana', abbreviation: 'LA' },
  { name: 'Maine', abbreviation: 'ME' },
  { name: 'Maryland', abbreviation: 'MD' },
  { name: 'Massachusetts', abbreviation: 'MA' },
  { name: 'Michigan', abbreviation: 'MI' },
  { name: 'Minnesota', abbreviation: 'MN' },
  { name: 'Mississippi', abbreviation: 'MS' },
  { name: 'Missouri', abbreviation: 'MO' },
  { name: 'Montana', abbreviation: 'MT' },
  { name: 'Nebraska', abbreviation: 'NE' },
  { name: 'Nevada', abbreviation: 'NV' },
  { name: 'New Hampshire', abbreviation: 'NH' },
  { name: 'New Jersey', abbreviation: 'NJ' },
  { name: 'New Mexico', abbreviation: 'NM' },
  { name: 'New York', abbreviation: 'NY' },
  { name: 'North Carolina', abbreviation: 'NC' },
  { name: 'North Dakota', abbreviation: 'ND' },
  { name: 'Ohio', abbreviation: 'OH' },
  { name: 'Oklahoma', abbreviation: 'OK' },
  { name: 'Oregon', abbreviation: 'OR' },
  { name: 'Pennsylvania', abbreviation: 'PA' },
  { name: 'Rhode Island', abbreviation: 'RI' },
  { name: 'South Carolina', abbreviation: 'SC' },
  { name: 'South Dakota', abbreviation: 'SD' },
  { name: 'Tennessee', abbreviation: 'TN' },
  { name: 'Texas', abbreviation: 'TX' },
  { name: 'Utah', abbreviation: 'UT' },
  { name: 'Vermont', abbreviation: 'VT' },
  { name: 'Virginia', abbreviation: 'VA' },
  { name: 'Washington', abbreviation: 'WA' },
  { name: 'West Virginia', abbreviation: 'WV' },
  { name: 'Wisconsin', abbreviation: 'WI' },
  { name: 'Wyoming', abbreviation: 'WY' }
];

function SearchUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const loadAllUsers = async () => {
      setLoading(true);
      try {
        console.log('Fetching users...');
        const response = await userService.searchUsers();
        console.log('API Response:', response);
        
        if (response && response.users) {
          console.log('Users data:', response.users);
          setUsers(response.users);
        } else {
          console.log('No users in response');
          setUsers([]);
        }
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(err.message);
        toast({
          title: 'Error loading users',
          description: err.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    loadAllUsers();
  }, [toast]);

  // Group users by state and city
  const groupedUsers = users.reduce((acc, user) => {
    const state = user.state || 'Unknown State';
    const city = user.city || 'Unknown City';
    
    if (!acc[state]) {
      acc[state] = {};
    }
    if (!acc[state][city]) {
      acc[state][city] = [];
    }
    acc[state][city].push(user);
    return acc;
  }, {});

  console.log('Grouped Users:', groupedUsers);

  // Sort states and cities alphabetically
  const sortedStates = Object.keys(groupedUsers).sort();
  const sortedCitiesByState = {};
  sortedStates.forEach(state => {
    sortedCitiesByState[state] = Object.keys(groupedUsers[state]).sort();
  });

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={6} align="stretch">
        <Text fontSize="2xl" fontWeight="bold" color="dnd.parchment">
          Search Users
        </Text>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {loading ? (
          <Box textAlign="center" py={8}>
            <Spinner size="xl" color="dnd.gold" />
          </Box>
        ) : users.length === 0 ? (
          <Box textAlign="center" py={8}>
            <Text color="dnd.parchment">No users found.</Text>
          </Box>
        ) : (
          <VStack spacing={8} align="stretch">
            {sortedStates.map((state) => (
              <Box key={state}>
                <Text fontSize="xl" fontWeight="bold" color="dnd.gold" mb={4}>
                  {state}
                </Text>
                {sortedCitiesByState[state].map((city) => (
                  <Box key={city} mb={6}>
                    <Text fontSize="lg" fontWeight="semibold" color="dnd.dungeonGray" mb={2}>
                      {city}
                    </Text>
                    <VStack spacing={4} align="stretch">
                      {groupedUsers[state][city].map((user) => (
                        <Link
                          key={user.id}
                          as={RouterLink}
                          to={`/profile/${user.id}`}
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
                                name={user.username}
                                src={user.profilePicture}
                                bg="dnd.gold"
                                color="dnd.dungeonGray"
                              />
                              <VStack align="start" spacing={1} flex={1}>
                                <Text fontWeight="bold" color="dnd.dungeonGray">
                                  {user.username}
                                </Text>
                                <Text fontSize="sm" color="gray.600">
                                  {user.bio || 'No bio available'}
                                </Text>
                              </VStack>
                            </HStack>
                          </Box>
                        </Link>
                      ))}
                    </VStack>
                  </Box>
                ))}
              </Box>
            ))}
          </VStack>
        )}
      </VStack>
    </Container>
  );
}

export default SearchUsers; 