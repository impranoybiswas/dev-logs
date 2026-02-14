'use client';

import React from 'react';

import { useRouter } from 'next/navigation';
import JobApplications from '@/components/JobApplications';
import { motion } from 'framer-motion';

export default function JobsPage() {
    const router = useRouter();

    // Check if user is authenticated
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    React.useEffect(() => {
        if (!token && typeof window !== 'undefined') {
            router.push('/auth/login');
        }
    }, [token, router]);

    if (!token) return null;

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-6xl mx-auto"
            >
                <div className="bg-muted/30 p-1 md:p-2 rounded-2xl border border-border/50">
                    <JobApplications />
                </div>
            </motion.div>
        </div>
    );
}
