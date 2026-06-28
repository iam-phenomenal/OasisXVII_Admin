import type { Metadata } from "next";
import { Geist, Geist_Mono, Material_Symbols_Outlined, Space_Grotesk } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-headline",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const materialSymbols = Material_Symbols_Outlined({
  variable: "--font-material-symbols",
  subsets: ["latin"],
  display: "optional",
});

export const metadata: Metadata = {
  title: "OasisXVII Admin",
  description: "Admin panel for OasisXVII — catalog, storefront, and checkout management.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} ${materialSymbols.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
