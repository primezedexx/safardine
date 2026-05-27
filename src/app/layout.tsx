import type { Metadata } from "next";
import { Inter, Dancing_Script, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const dancingScript = Dancing_Script({ subsets: ["latin"], variable: "--font-dancing-script" });
const playfairDisplay = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "Safar Dine | AI-Powered QR Menus",
  description: "Transform restaurant menus into AI-powered experiences with Safar Dine.",
  verification: {
    google: "wW7GB7MmkWDTAJ_b6nDndukavU48PW2EdFZtiUZukrM",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${dancingScript.variable} ${playfairDisplay.variable} antialiased`}>
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        {children}
      </body>
    </html>
  );
}

