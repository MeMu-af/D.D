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
  const [searchQuery, setSearchQuery] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      if (searchQuery) queryParams.append('query', searchQuery);
      if (city) queryParams.append('city', city);
      if (state) queryParams.append('state', state);

      const response = await fetch(`/api/users/search?${queryParams.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch users');
      
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={6} align="stretch">
        <Text fontSize="2xl" fontWeight="bold" color="dnd.parchment">
          Search Users
        </Text>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Search by username, bio, or interests"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="p-2 border rounded"
            />
            <input
              type="text"
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="p-2 border rounded"
            />
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="">Select State</option>
              {US_STATES.map((state) => (
                <option key={state.abbreviation} value={state.abbreviation}>
                  {state.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

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
          <VStack spacing={4} align="stretch">
            {users.map((user) => (
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
                        {user.city}, {user.state}
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