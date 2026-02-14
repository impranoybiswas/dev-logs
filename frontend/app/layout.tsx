import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import { ChatProvider } from "@/components/ChatProvider";
import ChatFloatingButton from "@/components/ChatFloatingButton";
import ChatWindow from "@/components/ChatWindow";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dev Logs",
  description: "A modern Point of job tracking app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >

        <Providers>
          <ChatProvider>
            <Navbar />
            <main className="pt-16">
              {children}
            </main>
            <ChatFloatingButton />
            <ChatWindow />
          </ChatProvider>
        </Providers>
      </body>
    </html>
  );
}
