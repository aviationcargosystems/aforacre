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
    "Verified farmland in South Bangalore, matched to how you will actually use it. Taxes, land suitability, and ownership checks up front.",
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
