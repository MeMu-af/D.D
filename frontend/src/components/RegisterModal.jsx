import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  useToast,
  Select,
  HStack,
  Text,
} from '@chakra-ui/react';
import { useAuth } from './AuthContext';

// List of US states with abbreviations
const US_STATES = [
  { name: 'Alabama', abbr: 'AL' },
  { name: 'Alaska', abbr: 'AK' },
  { name: 'Arizona', abbr: 'AZ' },
  { name: 'Arkansas', abbr: 'AR' },
  { name: 'California', abbr: 'CA' },
  { name: 'Colorado', abbr: 'CO' },
  { name: 'Connecticut', abbr: 'CT' },
  { name: 'Delaware', abbr: 'DE' },
  { name: 'Florida', abbr: 'FL' },
  { name: 'Georgia', abbr: 'GA' },
  { name: 'Hawaii', abbr: 'HI' },
  { name: 'Idaho', abbr: 'ID' },
  { name: 'Illinois', abbr: 'IL' },
  { name: 'Indiana', abbr: 'IN' },
  { name: 'Iowa', abbr: 'IA' },
  { name: 'Kansas', abbr: 'KS' },
  { name: 'Kentucky', abbr: 'KY' },
  { name: 'Louisiana', abbr: 'LA' },
  { name: 'Maine', abbr: 'ME' },
  { name: 'Maryland', abbr: 'MD' },
  { name: 'Massachusetts', abbr: 'MA' },
  { name: 'Michigan', abbr: 'MI' },
  { name: 'Minnesota', abbr: 'MN' },
  { name: 'Mississippi', abbr: 'MS' },
  { name: 'Missouri', abbr: 'MO' },
  { name: 'Montana', abbr: 'MT' },
  { name: 'Nebraska', abbr: 'NE' },
  { name: 'Nevada', abbr: 'NV' },
  { name: 'New Hampshire', abbr: 'NH' },
  { name: 'New Jersey', abbr: 'NJ' },
  { name: 'New Mexico', abbr: 'NM' },
  { name: 'New York', abbr: 'NY' },
  { name: 'North Carolina', abbr: 'NC' },
  { name: 'North Dakota', abbr: 'ND' },
  { name: 'Ohio', abbr: 'OH' },
  { name: 'Oklahoma', abbr: 'OK' },
  { name: 'Oregon', abbr: 'OR' },
  { name: 'Pennsylvania', abbr: 'PA' },
  { name: 'Rhode Island', abbr: 'RI' },
  { name: 'South Carolina', abbr: 'SC' },
  { name: 'South Dakota', abbr: 'SD' },
  { name: 'Tennessee', abbr: 'TN' },
  { name: 'Texas', abbr: 'TX' },
  { name: 'Utah', abbr: 'UT' },
  { name: 'Vermont', abbr: 'VT' },
  { name: 'Virginia', abbr: 'VA' },
  { name: 'Washington', abbr: 'WA' },
  { name: 'West Virginia', abbr: 'WV' },
  { name: 'Wisconsin', abbr: 'WI' },
  { name: 'Wyoming', abbr: 'WY' },
];

function RegisterModal({ isOpen, onClose }) {
  const [credentials, setCredentials] = useState({
    username: '',
    email: '',
    password: '',
    city: '',
    state: '',
  });
  const { register, loading, error } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!credentials.city || !credentials.state) {
      toast({
        title: 'Location Required',
        description: 'Please select both city and state',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      const registrationData = {
        username: credentials.username,
        email: credentials.email,
        password: credentials.password,
        city: credentials.city,
        state: credentials.state,
      };
      
      await register(registrationData);
      onClose();
      navigate('/profile');
      toast({
        title: 'Registration successful',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Registration failed',
        description: error.message || 'Please check your information and try again',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent bg="dnd.dungeonGray">
        <ModalHeader color="dnd.gold">Join D&D Connect</ModalHeader>
        <ModalCloseButton color="dnd.parchment" />
        <ModalBody pb={6}>
          <VStack spacing={4} as="form" onSubmit={handleSubmit}>
            <FormControl isRequired>
              <FormLabel color="dnd.parchment">Username</FormLabel>
              <Input
                type="text"
                name="username"
                value={credentials.username}
                onChange={handleChange}
                bg="white"
                color="black"
                isDisabled={loading}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel color="dnd.parchment">Email</FormLabel>
              <Input
                type="email"
                name="email"
                value={credentials.email}
                onChange={handleChange}
                bg="white"
                color="black"
                isDisabled={loading}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel color="dnd.parchment">Password</FormLabel>
              <Input
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                bg="white"
                color="black"
                isDisabled={loading}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel color="dnd.parchment">Location</FormLabel>
              <HStack spacing={4}>
                <FormControl isRequired>
                  <Input
                    type="text"
                    name="city"
                    value={credentials.city}
                    onChange={handleChange}
                    bg="white"
                    color="black"
                    placeholder="City"
                    isDisabled={loading}
                  />
                </FormControl>
                <FormControl isRequired width="150px">
                  <Select
                    name="state"
                    value={credentials.state}
                    onChange={handleChange}
                    bg="white"
                    color="black"
                    placeholder="State"
                    isDisabled={loading}
                  >
                    {US_STATES.map(state => (
                      <option key={state.abbr} value={state.abbr}>
                        {state.abbr}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </HStack>
              <Text fontSize="sm" color="dnd.parchment" mt={2}>
                This helps us connect you with nearby D&D players
              </Text>
            </FormControl>

            <Button
              type="submit"
              colorScheme="brand"
              isLoading={loading}
              loadingText="Registering..."
              width="full"
              isDisabled={loading}
            >
              Register
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default RegisterModal; 