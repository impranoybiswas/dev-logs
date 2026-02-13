'use client';

import { Result, Button } from 'antd';
import { useRouter } from 'next/navigation';
import JobApplications from '@/components/JobApplications';

export default function JobsPage() {
    const router = useRouter();

    // Check if user is authenticated
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    if (!token) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Result
                    status="403"
                    title="Authentication Required"
                    subTitle="Please login to view your job applications."
                    extra={
                        <Button type="primary" onClick={() => router.push('/auth/login')}>
                            Go to Login
                        </Button>
                    }
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-6xl mx-auto">
                <JobApplications />
            </div>
        </div>
    );
}
