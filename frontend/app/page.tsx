"use client";

import { Button, Typography, Space } from 'antd';
import Link from 'next/link';
import { motion } from 'framer-motion';

const { Title, Paragraph } = Typography;

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-6 md:p-12 text-center bg-background overflow-hidden relative">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-secondary/10 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
        className="z-10 max-w-5xl"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-black border border-primary/20 mb-8 tracking-wider uppercase">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Live Developers
          </div>
          <Title level={1} className="m-0! text-6xl! md:text-8xl! font-black! tracking-tighter! leading-none!">
            <span className="text-foreground">Code. </span>
            <span className="bg-linear-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">Log. </span>
            <span className="text-foreground">Level Up.</span>
          </Title>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Paragraph className="text-xl! md:text-3xl! max-w-3xl mx-auto text-muted-foreground! mb-12! leading-relaxed font-medium tracking-tight">
            The premium workspace for modern developers to track applications, document their journey, and showcase their professional edge.
          </Paragraph>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Space size="large" className="flex flex-col sm:flex-row justify-center gap-6">
            <Link href="/auth/register" passHref>
              <Button
                type="primary"
                size="large"
                className="h-16! px-12! text-xl! rounded-2xl! bg-primary! hover:bg-primary-hover! border-none shadow-2xl! shadow-primary/40 hover:shadow-primary/60 hover:scale-105 transition-all font-bold! tracking-tight!"
              >
                Join the Community
              </Button>
            </Link>
            <Link href="/auth/login" passHref>
              <Button
                size="large"
                className="h-16! px-12! text-xl! rounded-2xl! border-2! border-foreground/10 hover:border-primary! text-foreground! bg-background/50 backdrop-blur-md hover:bg-primary/5 transition-all font-bold! tracking-tight!"
              >
                Member Log In
              </Button>
            </Link>
          </Space>
        </motion.div>

        {/* Feature Grid */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12"
        >
          {[
            { label: 'Job Tracking', icon: '🎯' },
            { label: 'Profile Hub', icon: '👤' },
            { label: 'Connections', icon: '👥' },
            { label: 'Modern Ux', icon: '✨' }
          ].map((feature) => (
            <div key={feature.label} className="flex flex-col items-center space-y-3 group cursor-default">
              <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-300 group-hover:rotate-6">
                {feature.icon}
              </div>
              <span className="text-sm font-black text-muted-foreground/80 group-hover:text-primary transition-colors tracking-widest uppercase">{feature.label}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
