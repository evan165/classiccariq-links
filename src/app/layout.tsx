import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Classic Car IQ",
  description: "Classic Car IQ share links.",
  icons: {
    icon: [
      { url: "/favicon.ico?v=4c32daa" },
      { url: "/icon.png?v=4c32daa", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png?v=4c32daa" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
