import {
  Box,
  Flex,
  Button,
  Link,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  Text,
  Icon,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useState } from 'react';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';
import { FaUser, FaSearch, FaSignOutAlt } from 'react-icons/fa';

function Navbar() {
  const { isAuthenticated, logout, user, loading } = useAuth();
  const navigate = useNavigate();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const bgColor = 'dnd.dungeonGray';
  const textColor = 'dnd.parchment';

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
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
                  _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
                  _active={{ bg: 'rgba(255, 255, 255, 0.2)' }}
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
                <MenuList bg={bgColor} borderColor="dnd.gold">
                  <MenuItem
                    as={RouterLink}
                    to="/profile"
                    icon={<Icon as={FaUser} color="dnd.gold" />}
                    _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
                    _focus={{ bg: 'rgba(255, 255, 255, 0.1)' }}
                  >
                    Profile
                  </MenuItem>
                  <MenuItem
                    as={RouterLink}
                    to="/search"
                    icon={<Icon as={FaSearch} color="dnd.gold" />}
                    _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
                    _focus={{ bg: 'rgba(255, 255, 255, 0.1)' }}
                  >
                    Search
                  </MenuItem>
                  <MenuItem
                    onClick={handleLogout}
                    icon={<Icon as={FaSignOutAlt} color="dnd.gold" />}
                    _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
                    _focus={{ bg: 'rgba(255, 255, 255, 0.1)' }}
                    isDisabled={isLoggingOut}
                  >
                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                  </MenuItem>
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