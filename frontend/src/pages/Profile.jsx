import {
  Box,
  Container,
  VStack,
  HStack,
  Avatar,
  Text,
  Heading,
  useColorModeValue,
  Card,
  CardBody,
  IconButton,
  useDisclosure,
  Tag,
  TagLabel,
  Wrap,
  WrapItem,
  Divider,
} from '@chakra-ui/react';
import { useAuth } from '../components/AuthContext';
import { EditIcon } from '@chakra-ui/icons';
import { useState, useEffect } from 'react';
import EditProfileModal from '../components/EditProfileModal';

function Profile() {
  const { user, fetchUser } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isEditing, setIsEditing] = useState(false);
  const bgColor = useColorModeValue('dnd.dungeonGray', 'dnd.dungeonGray');
  const textColor = useColorModeValue('dnd.parchment', 'dnd.parchment');
  const cardBg = useColorModeValue('dnd.darkGray', 'dnd.darkGray');

  // Refresh user data when modal closes
  useEffect(() => {
    if (!isOpen) {
      fetchUser();
    }
  }, [isOpen, fetchUser]);

  return (
    <Box minH="100vh" bg={bgColor} py={8}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          {/* Profile Header */}
          <Card bg={cardBg} color={textColor}>
            <CardBody>
              <HStack spacing={8} align="center">
                <Box position="relative">
                  <Avatar
                    size="2xl"
                    name={user?.username}
                    src={user?.profilePicture}
                    bg="dnd.gold"
                    color="dnd.dungeonGray"
                  />
                  <IconButton
                    aria-label="Edit profile"
                    icon={<EditIcon />}
                    position="absolute"
                    bottom={0}
                    right={0}
                    bg="dnd.gold"
                    color="dnd.dungeonGray"
                    _hover={{ bg: 'dnd.goldHover' }}
                    onClick={onOpen}
                  />
                </Box>
                <VStack align="start" spacing={2}>
                  <Heading size="lg">{user?.username}</Heading>
                  <Text fontSize="md" color="dnd.gold">
                    {user?.city && user?.state ? `${user.city}, ${user.state}` : 'Location not set'}
                  </Text>
                </VStack>
              </HStack>
            </CardBody>
          </Card>

          {/* Game Preferences */}
          <Card bg={cardBg} color={textColor}>
            <CardBody>
              <Heading size="md" mb={6}>Game Preferences</Heading>
              <VStack align="start" spacing={6}>
                {/* Experience Level */}
                <Box>
                  <Text fontWeight="bold" fontSize="lg" color="dnd.gold" mb={2}>
                    Experience Level
                  </Text>
                  <Text fontSize="md">
                    {user?.experience || 'Not specified'}
                  </Text>
                </Box>

                <Divider borderColor="dnd.gold" opacity={0.3} />

                {/* Favorite Classes */}
                <Box>
                  <Text fontWeight="bold" fontSize="lg" color="dnd.gold" mb={2}>
                    Favorite Classes
                  </Text>
                  {user?.favoriteClasses && user.favoriteClasses.length > 0 ? (
                    <Wrap spacing={2}>
                      {user.favoriteClasses.map((className) => (
                        <WrapItem key={className}>
                          <Tag
                            size="lg"
                            borderRadius="full"
                            variant="solid"
                            bg="dnd.gold"
                            color="dnd.dungeonGray"
                          >
                            <TagLabel>{className}</TagLabel>
                          </Tag>
                        </WrapItem>
                      ))}
                    </Wrap>
                  ) : (
                    <Text fontSize="md">No favorite classes selected</Text>
                  )}
                </Box>

                <Divider borderColor="dnd.gold" opacity={0.3} />

                {/* Bio */}
                {user?.bio && (
                  <Box>
                    <Text fontWeight="bold" fontSize="lg" color="dnd.gold" mb={2}>
                      Bio
                    </Text>
                    <Text fontSize="md" whiteSpace="pre-wrap">
                      {user.bio}
                    </Text>
                  </Box>
                )}
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>

      <EditProfileModal isOpen={isOpen} onClose={onClose} />
    </Box>
  );
}

export default Profile; 