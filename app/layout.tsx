import React from "react"
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SessionProvider } from "@/components/providers/session-provider";
import "./globals.css";
import ClickSpark from "@/components/ui/click-spark";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "CampusFind - Campus Lost & Found",
  description:
    "Report lost items, find what others have found, and reunite with your belongings on campus.",
  keywords: ["lost and found", "campus", "university", "items", "search"],
  generator: 'v0.app'
};

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <SessionProvider>
          <ClickSpark
            sparkColor="#fff"
            sparkSize={10}
            sparkRadius={15}
            sparkCount={8}
            duration={400}
          >
            {children}
          </ClickSpark>
        </SessionProvider>
        <Analytics />
      </body>
    </html>
  );
}
