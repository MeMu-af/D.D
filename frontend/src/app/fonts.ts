import { MedievalSharp, Cinzel } from 'next/font/google';

export const medievalSharp = MedievalSharp({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-medieval',
});

export const cinzel = Cinzel({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-cinzel',
}); 