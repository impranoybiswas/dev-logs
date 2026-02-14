'use client';

import { useEffect } from 'react';
import { Card, Descriptions, Button, Avatar, Typography, Skeleton, Result, Row, Col, Statistic, Progress, Badge } from 'antd';
import { UserOutlined, CalendarOutlined, ManOutlined, WomanOutlined, FileTextOutlined, TeamOutlined, BellOutlined, RocketOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import SocialLinks from '@/components/SocialLinks';
import { motion } from 'framer-motion';
import EditProfileModal from '@/components/EditProfileModal';
import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const { Title, Text } = Typography;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function ProfilePage() {
    const router = useRouter();
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const { data: user, isLoading: isUserLoading, error: userError } = useQuery({
        queryKey: ['profile'],
        queryFn: async () => {
            const response = await api.get('/users/profile');
            return response.data;
        },
        enabled: !!token,
        retry: (failureCount, error: AxiosError) => {
            if (error.response?.status === 401) return false;
            return failureCount < 3;
        },
    });

    const { data: stats, isLoading: isStatsLoading } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: async () => {
            const response = await api.get('/users/dashboard/stats');
            return response.data;
        },
        enabled: !!token,
    });

    useEffect(() => {
        if (!token && typeof window !== 'undefined') {
            router.push('/auth/login');
        } else if (userError && (userError as AxiosError).response?.status === 401) {
            router.push('/auth/login');
        }
    }, [token, userError, router]);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    if (!token) return null;

    if (userError) {
        if ((userError as AxiosError).response?.status === 401) return null;
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
                <Result status="error" title="Failed to fetch profile" subTitle={userError.message} />
            </div>
        );
    }

    const isLoading = isUserLoading || isStatsLoading;

    return (
        <div className="min-h-[calc(100vh-64px)] bg-background p-4 md:p-8 pt-24">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-7xl mx-auto space-y-8"
            >
                {/* Dashboard Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
                    <div>
                        <Title level={2} className="m-0 text-foreground!">Dashboard Overview</Title>
                        <Text type="secondary">Welcome back, {user?.name || 'User'}!
                            <br className='block md:hidden' />
                            {" "} Here&apos;s what&apos;s happening.</Text>
                    </div>
                    <div className="flex gap-2">
                        <Button icon={<FileTextOutlined />} onClick={() => router.push('/resume-builder')}>
                            Resume Builder
                        </Button>
                        <Button type="primary" icon={<UserOutlined />} onClick={() => setIsEditModalOpen(true)}>
                            Edit Profile
                        </Button>
                    </div>
                </div>

                {/* Stat Cards */}
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} lg={6}>
                        <Card
                            style={{
                                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                                border: '1px solid var(--border)',
                                borderRadius: '0.75rem',
                                overflow: 'hidden',
                                padding: '20px'
                            }}
                        >
                            <Statistic
                                title="Total Connections"
                                value={stats?.totalFriends || 0}
                                prefix={<TeamOutlined style={{ color: 'var(--primary)', marginRight: '8px' }} />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card
                            style={{
                                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                                border: '1px solid var(--border)',
                                borderRadius: '0.75rem',
                                overflow: 'hidden',
                                padding: '20px'
                            }}
                        >
                            <Statistic
                                title="Pending Requests"
                                value={stats?.pendingFriends || 0}
                                styles={{ content: { color: stats?.pendingFriends > 0 ? '#faad14' : 'inherit' } }}
                                prefix={<Badge dot={stats?.pendingFriends > 0}><BellOutlined style={{ color: '#faad14', marginRight: '8px' }} /></Badge>}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card
                            style={{
                                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                                border: '1px solid var(--border)',
                                borderRadius: '0.75rem',
                                overflow: 'hidden',
                                padding: '20px'
                            }}
                        >
                            <Statistic
                                title="Unread Notifications"
                                value={stats?.unreadNotifications || 0}
                                styles={{ content: { color: stats?.unreadNotifications > 0 ? '#f5222d' : 'inherit' } }}
                                prefix={<BellOutlined style={{ color: '#f5222d', marginRight: '8px' }} />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card
                            style={{
                                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                                border: '1px solid var(--border)',
                                borderRadius: '0.75rem',
                                overflow: 'hidden',
                                padding: '20px'
                            }}
                        >
                            <div className="flex flex-col">
                                <Text type="secondary" className="mb-2 text-sm uppercase font-semibold">Resume Completeness</Text>
                                <div className="flex items-center gap-4">
                                    <Progress
                                        type="circle"
                                        percent={stats?.resumeCompleteness || 0}
                                        size={40}
                                        strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
                                    />
                                    <Text className="font-bold text-lg">{stats?.resumeCompleteness || 0}%</Text>
                                </div>
                            </div>
                        </Card>
                    </Col>
                </Row>

                <Row gutter={[24, 24]}>
                    {/* Profile Overview Card */}
                    <Col xs={24} lg={14}>
                        <Card
                            title={<span className="flex items-center gap-2"><UserOutlined /> Profile Overview</span>}
                            style={{
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                border: '1px solid var(--border)',
                                borderRadius: '1rem',
                                height: '100%'
                            }}
                        >
                            {isLoading ? (
                                <Skeleton active avatar paragraph={{ rows: 6 }} />
                            ) : (
                                <div className="flex flex-col md:flex-row gap-8 py-2">
                                    <div className="flex flex-col items-center">
                                        <div className="relative p-1 rounded-full bg-linear-to-br from-primary to-accent mb-4">
                                            <Avatar
                                                size={120}
                                                icon={<UserOutlined />}
                                                src={user.profilePhoto}
                                                style={{ backgroundColor: 'var(--card)', border: '2px solid var(--card)' }}
                                            />
                                        </div>
                                        <Title level={4} className="mb-0 text-center">{user.name}</Title>
                                        <Text type="secondary">{user.email}</Text>
                                    </div>

                                    <div className="grow">
                                        <Descriptions
                                            column={1}
                                            className="bg-muted/10 p-4 rounded-xl"
                                            labelStyle={{ color: 'gray', fontWeight: 500 }}
                                        >
                                            <Descriptions.Item label="Gender">
                                                <span className="capitalize font-medium">
                                                    {user.gender === 'male' && <ManOutlined className="mr-2 text-blue-500" />}
                                                    {user.gender === 'female' && <WomanOutlined className="mr-2 text-pink-500" />}
                                                    {user.gender || 'Not set'}
                                                </span>
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Birth Date">
                                                <span className="font-medium">
                                                    <CalendarOutlined className="mr-2 text-primary" />
                                                    {user.birthDate ? new Date(user.birthDate).toLocaleDateString() : 'Not provided'}
                                                </span>
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Member Since">
                                                <span className="font-medium text-xs text-secondary">
                                                    {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
                                                </span>
                                            </Descriptions.Item>
                                        </Descriptions>
                                        <div className="mt-6">
                                            <Text strong className="mb-2">Social Presence</Text>
                                            <SocialLinks />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </Card>
                    </Col>

                    {/* Applications Chart Card */}
                    <Col xs={24} lg={10}>
                        <Card
                            title={<span className="flex items-center gap-2"><RocketOutlined /> Job Applications</span>}
                            style={{
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                border: '1px solid var(--border)',
                                borderRadius: '1rem',
                                height: '100%'
                            }}
                        >
                            {isLoading ? (
                                <Skeleton active paragraph={{ rows: 6 }} />
                            ) : stats?.jobApplications?.length > 0 ? (


                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={stats.jobApplications}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="count"
                                                nameKey="status"

                                            >
                                                {stats.jobApplications.map((entry: number, index: number) => (

                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={COLORS[index % COLORS.length]}
                                                        stroke="none"
                                                    />
                                                ))}
                                            </Pie>

                                            <text
                                                x="51%"
                                                y="45%"
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                                className="fill-foreground font-bold text-2xl"
                                                style={{ fontSize: '3rem', fontWeight: 'bold', fill: 'var(--primary)' }}
                                            >
                                                {stats.jobApplications.length}
                                            </text>

                                            <Tooltip />
                                            <Legend verticalAlign="bottom" height={36} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>

                            ) : (
                                <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">
                                    <RocketOutlined style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }} />
                                    <Text type="secondary">No job applications tracked yet.</Text>
                                    <Button type="link" onClick={() => router.push('/jobs')}>Start Applying</Button>
                                </div>
                            )}
                        </Card>
                    </Col>
                </Row>
            </motion.div>

            {user && (
                <EditProfileModal
                    open={isEditModalOpen}
                    onCancel={() => setIsEditModalOpen(false)}
                    user={user}
                />
            )}
        </div >
    );
}
