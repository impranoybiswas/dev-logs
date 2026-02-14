'use client';

import React from 'react';
import { Typography, Breadcrumb, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import ResumeBuilder from '@/components/ResumeBuilder';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';

const { Title } = Typography;

export default function ResumeBuilderPage() {
    const router = useRouter();

    // Protect the route
    const { isLoading, error } = useQuery({
        queryKey: ['profile'],
        queryFn: async () => {
            const response = await api.get('/users/profile');
            return response.data;
        },
        retry: false,
    });

    React.useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/auth/login');
        } else if (error) {
            router.push('/auth/login');
        }
    }, [error, router]);

    if (isLoading) return <div className="min-h-[calc(100vh-64px)] bg-background flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-[calc(100vh-64px)] bg-background">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
                <div className="mb-6 flex items-center gap-4">
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => router.back()}
                        type="text"
                    />
                    <div>
                        <Breadcrumb
                            items={[
                                { title: <a href="/profile">Profile</a> },
                                { title: 'Resume Builder' },
                            ]}
                        />
                        <Title level={2} style={{ margin: 0, marginTop: '8px' }}>Resume Builder</Title>
                        <Title level={5} style={{ color: 'gray' }}>(Under Test)</Title>
                    </div>
                </div>

                <ResumeBuilder />
            </div>
        </div>
    );
}
