import { Inter } from 'next/font/google'
import { MedievalSharp, Cinzel } from 'next/font/google'

export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export const medievalSharp = MedievalSharp({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
})

export const cinzel = Cinzel({
  subsets: ['latin'],
  display: 'swap',
})

export const fonts = {
  inter,
  medievalSharp,
  cinzel,
} 