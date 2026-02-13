"use client";

import { Button, Typography, Space } from 'antd';
import Link from 'next/link';
import { motion } from 'framer-motion';

const { Title, Paragraph } = Typography;

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-8 text-center bg-background overflow-hidden relative">
      {/* Decorative background blobs */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="z-10"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Title level={1} className="mb-4! text-5xl! md:text-7xl! font-extrabold tracking-tight">
            <span className="bg-linear-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Dev Logs
            </span>
          </Title>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Paragraph className="text-lg! md:text-2xl! max-w-2xl mx-auto text-muted-foreground! mb-10! leading-relaxed font-medium">
            The modern workspace for developers to track applications, document progress, and build their professional identity.
          </Paragraph>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Space size="large" className="flex flex-wrap justify-center">
            <Link href="/auth/login" passHref>
              <Button
                type="primary"
                size="large"
                className="h-14! px-10! text-lg! rounded-xl! bg-primary! hover:bg-primary-hover! border-none shadow-lg! hover:shadow-primary/25 transition-all font-semibold!"
              >
                Login to Dashboard
              </Button>
            </Link>
            <Link href="/auth/register" passHref>
              <Button
                size="large"
                className="h-14! px-10! text-lg! rounded-xl! border-2 border-primary/20 hover:border-primary/50 text-foreground! bg-transparent hover:bg-primary/5 shadow-sm! transition-all font-semibold!"
              >
                Create Account
              </Button>
            </Link>
          </Space>
        </motion.div>

        {/* Feature badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-20 flex flex-wrap justify-center gap-4 md:gap-8 opacity-60"
        >
          {['Job Tracking', 'Profile Building', 'Social Links', 'Modern UI'].map((feature) => (
            <div key={feature} className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="text-sm font-medium">{feature}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
