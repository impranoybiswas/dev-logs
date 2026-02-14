import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import { ChatProvider } from "@/components/ChatProvider";
import ChatFloatingButton from "@/components/ChatFloatingButton";
import ChatWindow from "@/components/ChatWindow";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
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
        className={`${outfit.variable} antialiased font-sans`}
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
