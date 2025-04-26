import { Box, Flex, Button, useColorMode } from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import { MoonIcon, SunIcon } from '@chakra-ui/icons'

const Navbar = () => {
  const { colorMode, toggleColorMode } = useColorMode()

  return (
    <Box bg={colorMode === 'light' ? 'white' : 'gray.800'} px={4} boxShadow="sm">
      <Flex h={16} alignItems="center" justifyContent="space-between">
        <Box>
          <Link to="/">
            <Button variant="ghost">Home</Button>
          </Link>
        </Box>
        <Button onClick={toggleColorMode}>
          {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
        </Button>
      </Flex>
    </Box>
  )
}

export default Navbar 