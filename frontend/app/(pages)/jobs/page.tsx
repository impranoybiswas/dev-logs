"use client";

import React from "react";

import { useRouter } from "next/navigation";
import JobApplications from "@/components/JobApplications";
import { motion } from "framer-motion";

export default function JobsPage() {
  const router = useRouter();

  // Check if user is authenticated
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  React.useEffect(() => {
    if (!token && typeof window !== "undefined") {
      router.push("/auth/login");
    }
  }, [token, router]);

  if (!token) return null;

  return (
    <div className="page-container">
      <motion.section
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="px-5"
      >
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-tight">
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
