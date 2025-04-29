import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Textarea,
  Select,
  useColorModeValue,
  Avatar,
  IconButton,
  Box,
  useToast,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
  Flex,
  Progress,
} from '@chakra-ui/react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { EditIcon } from '@chakra-ui/icons';

const DND_CLASSES = [
  'Barbarian',
  'Bard',
  'Cleric',
  'Druid',
  'Fighter',
  'Monk',
  'Paladin',
  'Ranger',
  'Rogue',
  'Sorcerer',
  'Warlock',
  'Wizard',
];

function EditProfileModal({ isOpen, onClose }) {
  const { user, updateUser, uploadProfileImage, loading } = useAuth();
  const [formData, setFormData] = useState({
    location: user?.location || '',
    experience: user?.experience || '',
    bio: user?.bio || '',
    favoriteClasses: user?.favoriteClasses || [],
  });
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || '');
  const [selectedClass, setSelectedClass] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const bgColor = useColorModeValue('dnd.dungeonGray', 'dnd.dungeonGray');
  const textColor = useColorModeValue('dnd.parchment', 'dnd.parchment');
  const toast = useToast();

  // Update profile picture when user changes
  useEffect(() => {
    if (user?.profilePicture) {
      setProfilePicture(user.profilePicture);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddClass = () => {
    if (selectedClass && !formData.favoriteClasses.includes(selectedClass)) {
      setFormData(prev => ({
        ...prev,
        favoriteClasses: [...prev.favoriteClasses, selectedClass]
      }));
      setSelectedClass('');
    }
  };

  const handleRemoveClass = (className) => {
    setFormData(prev => ({
      ...prev,
      favoriteClasses: prev.favoriteClasses.filter(c => c !== className)
    }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 5MB',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      // Show preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload image
      const response = await uploadProfileImage(file);
      setProfilePicture(response.profilePicture);
      
      toast({
        title: 'Profile picture updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error uploading image',
        description: error.message || 'Please try again',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedUser = await updateUser({
        id: user.id,
        ...formData,
        profilePicture: profilePicture,
      });
      setProfilePicture(updatedUser.profilePicture);
      onClose();
      toast({
        title: 'Profile updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error updating profile',
        description: error.message || 'Please try again',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent bg={bgColor} color={textColor}>
        <ModalHeader>Edit Profile</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              {/* Profile Picture Upload */}
              <Box position="relative">
                <Avatar
                  size="2xl"
                  name={user?.username}
                  src={profilePicture}
                  bg="dnd.gold"
                  color="dnd.dungeonGray"
                />
                <IconButton
                  aria-label="Change profile picture"
                  icon={<EditIcon />}
                  position="absolute"
                  bottom={0}
                  right={0}
                  bg="dnd.gold"
                  color="dnd.dungeonGray"
                  _hover={{ bg: 'dnd.goldHover' }}
                  onClick={() => fileInputRef.current?.click()}
                  isDisabled={loading}
                />
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  display="none"
                  onChange={handleImageChange}
                  isDisabled={loading}
                />
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <Progress
                    value={uploadProgress}
                    size="xs"
                    colorScheme="yellow"
                    position="absolute"
                    bottom="-2"
                    left="0"
                    right="0"
                  />
                )}
              </Box>

              {/* Location */}
              <FormControl>
                <FormLabel>Location</FormLabel>
                <Input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Enter your location"
                  isDisabled={loading}
                />
              </FormControl>

              {/* Experience Level */}
              <FormControl>
                <FormLabel>Experience Level</FormLabel>
                <Select
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder="Select your experience level"
                  isDisabled={loading}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Veteran">Veteran</option>
                </Select>
              </FormControl>

              {/* Favorite Classes */}
              <FormControl>
                <FormLabel>Favorite Classes</FormLabel>
                <Wrap spacing={2} mb={2}>
                  {formData.favoriteClasses.map((className) => (
                    <WrapItem key={className}>
                      <Tag
                        size="lg"
                        borderRadius="full"
                        variant="solid"
                        bg="dnd.gold"
                        color="dnd.dungeonGray"
                      >
                        <TagLabel>{className}</TagLabel>
                        <TagCloseButton
                          onClick={() => handleRemoveClass(className)}
                          isDisabled={loading}
                        />
                      </Tag>
                    </WrapItem>
                  ))}
                </Wrap>
                <Flex gap={2}>
                  <Select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    placeholder="Select a class"
                    isDisabled={loading}
                  >
                    {DND_CLASSES.filter(c => !formData.favoriteClasses.includes(c)).map((className) => (
                      <option key={className} value={className}>
                        {className}
                      </option>
                    ))}
                  </Select>
                  <Button
                    onClick={handleAddClass}
                    colorScheme="yellow"
                    isDisabled={!selectedClass || loading}
                  >
                    Add
                  </Button>
                </Flex>
              </FormControl>

              {/* Bio */}
              <FormControl>
                <FormLabel>Bio</FormLabel>
                <Textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us about yourself and your D&D experience"
                  isDisabled={loading}
                />
              </FormControl>

              <Button
                type="submit"
                colorScheme="yellow"
                width="full"
                mt={4}
                isLoading={loading}
                loadingText="Saving changes..."
                isDisabled={loading}
              >
                Save Changes
              </Button>
            </VStack>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default EditProfileModal; 