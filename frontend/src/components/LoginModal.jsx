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

function LoginModal({ isOpen, onClose }) {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const { login, loading, error } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const user = await login(credentials.email, credentials.password);
      if (user) {
        onClose();
        navigate('/profile');
        toast({
          title: 'Login successful',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Login failed',
        description: error.message || 'Please check your credentials and try again',
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
        <ModalHeader color="dnd.gold">Welcome Back</ModalHeader>
        <ModalCloseButton color="dnd.parchment" />
        <ModalBody pb={6}>
          <VStack spacing={4} as="form" onSubmit={handleSubmit}>
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

            <Button
              type="submit"
              colorScheme="brand"
              isLoading={loading}
              loadingText="Logging in..."
              width="full"
              isDisabled={loading}
            >
              Login
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default LoginModal; 