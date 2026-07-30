import type { Metadata } from "next";
import {Playfair_Display } from "next/font/google";
import "./globals.css";

import { Space_Grotesk, Inter } from "next/font/google";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });
const inter = Inter({ subsets: ["latin"], variable: "--font-body" });

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Spencer Water Services Ltd",
  description:
    "Corporate website and operations dashboard for Spencer Water Services Ltd.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[color:var(--background)] text-[color:var(--foreground)]">
        {children}
        className={`${spaceGrotesk.variable} ${inter.variable} font-sans`}
      </body>
    </html>
  );
}
