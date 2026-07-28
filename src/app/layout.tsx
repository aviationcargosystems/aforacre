import type { Metadata } from "next";
import { Playfair_Display, Montserrat } from "next/font/google";
import "./globals.css";
import { SiteChrome } from "@/components/site-chrome";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "A for Acre | South Bangalore",
  description:
    "Explore farmland, farmhouse plots, and weekend getaway land across South Bangalore - matched to your journey, with taxes, land suitability, and verified ownership up front.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${playfair.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-accent/20 selection:text-foreground">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
