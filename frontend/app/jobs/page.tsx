'use client';

import { Result, Button } from 'antd';
import { useRouter } from 'next/navigation';
import JobApplications from '@/components/JobApplications';
import { motion } from 'framer-motion';

export default function JobsPage() {
    const router = useRouter();

    // Check if user is authenticated
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    if (!token) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center min-h-screen bg-background"
            >
                <Result
                    status="403"
                    title="Authentication Required"
                    subTitle="Please login to view your job applications."
                    extra={
                        <Button type="primary" onClick={() => router.push('/auth/login')} className="bg-primary! hover:bg-primary-hover!">
                            Go to Login
                        </Button>
                    }
                />
            </motion.div>
        );
    }

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
