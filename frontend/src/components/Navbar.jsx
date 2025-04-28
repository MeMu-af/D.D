import {
  Box,
  Flex,
  Button,
  Link,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  Text,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useState } from 'react';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';

function Navbar() {
  const { isAuthenticated, logout, user, loading } = useAuth();
  const navigate = useNavigate();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const bgColor = 'dnd.dungeonGray';
  const textColor = 'dnd.parchment';

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <>
      <Box bg={bgColor} px={4} py={3} boxShadow="md">
        <Flex maxW="container.xl" mx="auto" justify="space-between" align="center">
          <Link as={RouterLink} to="/" color={textColor} fontSize="xl" fontWeight="bold">
            D&D Connect
          </Link>

          <Flex gap={4} align="center">
            {!loading && (isAuthenticated ? (
              <Menu>
                <MenuButton
                  as={Button}
                  variant="ghost"
                  p={0}
                  _hover={{ bg: 'transparent' }}
                >
                  <Flex align="center" gap={2}>
                    <Avatar
                      size="sm"
                      name={user?.username}
                      src={user?.profilePicture}
                      bg="dnd.gold"
                      color="dnd.dungeonGray"
                    />
                    <Text color={textColor}>{user?.username}</Text>
                  </Flex>
                </MenuButton>
                <MenuList>
                  <MenuItem as={RouterLink} to="/profile">Profile</MenuItem>
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </MenuList>
              </Menu>
            ) : (
              <>
                <Button
                  colorScheme="brand"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsLoginModalOpen(true)}
                >
                  Login
                </Button>
                <Button
                  colorScheme="brand"
                  size="sm"
                  onClick={() => setIsRegisterModalOpen(true)}
                >
                  Register
                </Button>
              </>
            ))}
          </Flex>
        </Flex>
      </Box>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
      />
    </>
  );
}

export default Navbar; 