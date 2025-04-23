import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { medievalSharp, cinzel } from './fonts';
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dungeon & Dragons Finder",
  description: "Find players near you to play Dungeons & Dragons with",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${medievalSharp.variable} ${cinzel.variable}`}>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
