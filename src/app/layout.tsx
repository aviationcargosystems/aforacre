import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { SiteChrome } from "@/components/site-chrome";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "A for Acre | South Bangalore",
  description:
    "Explore farmland, farmhouse plots, and weekend-getaway land across South Bangalore — matched to your journey, with taxes, land suitability, and trusted local professionals.",
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
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
