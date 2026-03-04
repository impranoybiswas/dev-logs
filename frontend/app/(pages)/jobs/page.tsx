"use client";

import React from "react";
import { useRouter } from "next/navigation";
import JobApplications from "@/components/JobApplications";
import { motion } from "framer-motion";

export default function JobsPage() {
  const router = useRouter();

  const [isChecking, setIsChecking] = React.useState(true);

  React.useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/auth/login");
    } else {
      setIsChecking(false);
    }
  }, [router]);

  if (isChecking) return null;

  return (
    <div className="page-container">
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-foreground leading-tight mb-6">
          Job{" "}
          <span className="bg-linear-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Applications
          </span>
        </h1>

        <JobApplications />
      </motion.section>
    </div>
  );
}
