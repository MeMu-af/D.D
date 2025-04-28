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
} from '@chakra-ui/react';
import { useAuth } from './AuthContext';

function RegisterModal({ isOpen, onClose }) {
  const [credentials, setCredentials] = useState({
    username: '',
    email: '',
    password: '',
    location: '',
  });
  const { register, loading, error } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const registrationData = {
        username: credentials.username,
        email: credentials.email,
        password: credentials.password,
        ...(credentials.location ? { location: credentials.location } : {})
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

            <FormControl>
              <FormLabel color="dnd.parchment">Location (Optional)</FormLabel>
              <Input
                type="text"
                name="location"
                value={credentials.location}
                onChange={handleChange}
                bg="white"
                color="black"
                placeholder="City, State"
                isDisabled={loading}
              />
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