"use client";

import { Button, Typography, Space } from "antd";
import Link from "next/link";
import { motion } from "framer-motion";

const { Title, Paragraph } = Typography;

export default function Home() {
  return (
    <div className="page-container selection:bg-primary/20">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[140px] animate-pulse" />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[140px] animate-pulse"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-[30%] left-[20%] w-[30%] h-[30%] bg-secondary/5 rounded-full blur-[100px] animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <section className="relative z-10 flex flex-col justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-5xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="mb-10"
          >
            <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-primary/10 text-primary text-[13px] font-bold border border-primary/20 mb-10 tracking-[0.15em] uppercase shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
              </span>
              Next-Gen Dev Workspace
            </div>

            <Title
              level={1}
              className="m-0! text-6xl! md:text-9xl! font-black tracking-tighter leading-[0.9] text-foreground!"
            >
              <span className="block">Elevate Your</span>
              <span className="bg-linear-to-r from-primary via-accent to-secondary bg-clip-text text-transparent italic">
                Development.
              </span>
            </Title>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            <Paragraph className="text-xl! md:text-3xl! max-w-2xl mx-auto text-muted-foreground! mb-16 leading-relaxed font-medium tracking-tight">
              The premium hub for professional developers to manage their
              career, track growth, and connect with the elite.
            </Paragraph>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            <Space
              size="large"
              className="flex flex-col sm:flex-row justify-center gap-8"
            >
              <Link href="/auth/register" passHref>
                <Button
                  type="primary"
                  size="large"
                  className="h-16 px-12 text-lg rounded-2xl bg-primary hover:bg-primary-hover border-none shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] transition-all font-bold tracking-tight"
                >
                  Start Your Journey
                </Button>
              </Link>
              <Link href="/auth/login" passHref>
                <Button
                  size="large"
                  className="h-16 px-12 text-lg rounded-2xl border-2 border-border hover:border-primary text-foreground bg-background/40 backdrop-blur-xl hover:bg-primary/5 transition-all font-bold tracking-tight"
                >
                  Member Access
                </Button>
              </Link>
            </Space>
          </motion.div>

          {/* Enhanced Feature Grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.4 }}
            className="mt-32 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              {
                label: "Job Tracker",
                icon: "🎯",
                desc: "Manage applications with precision",
              },
              {
                label: "Smart Profile",
                icon: "👤",
                desc: "Showcase your engineering craft",
              },
              {
                label: "Network",
                icon: "👥",
                desc: "Bridge with industry leaders",
              },
              {
                label: "Analytics",
                icon: "📊",
                desc: "Visualize your progress",
              },
            ].map((feature) => (
              <div
                key={feature.label}
                className="premium-card p-8 text-left group bg-card/30 backdrop-blur-sm hover:bg-primary/5 transition-all"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-500 group-hover:rotate-3 shadow-inner">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 tracking-tight">
                  {feature.label}
                </h3>
                <p className="text-sm text-muted-foreground font-medium leading-snug">
                  {feature.desc}
                </p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
