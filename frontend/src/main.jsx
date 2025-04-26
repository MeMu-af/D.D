import React from 'react'
import ReactDOM from 'react-dom/client'
import { ChakraProvider, ColorModeScript, extendTheme } from '@chakra-ui/react'
import App from './App'
import './index.css'

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  colors: {
    brand: {
      50: '#f0e4ff',
      100: '#cbb2ff',
      200: '#a67fff',
      300: '#804dff',
      400: '#5a1aff',
      500: '#4100e6',
      600: '#3200b4',
      700: '#230082',
      800: '#140051',
      900: '#070021',
    },
    dnd: {
      gold: '#FFD700',
      parchment: '#F5E6D3',
      dragonRed: '#8B0000',
      magicBlue: '#4169E1',
      forestGreen: '#228B22',
      dungeonGray: '#2F4F4F',
    }
  },
  fonts: {
    heading: '"Cinzel", serif',
    body: '"Crimson Text", serif',
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'bold',
        borderRadius: 'md',
        textTransform: 'uppercase',
        letterSpacing: 'wider',
      },
      variants: {
        solid: {
          bg: 'dnd.gold',
          color: 'dnd.dungeonGray',
          _hover: {
            bg: 'dnd.magicBlue',
          },
        },
        outline: {
          borderColor: 'dnd.gold',
          color: 'dnd.gold',
          _hover: {
            bg: 'dnd.dragonRed',
            color: 'dnd.parchment',
          },
        },
      },
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <App />
    </ChakraProvider>
  </React.StrictMode>
) 