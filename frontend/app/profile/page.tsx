'use client';

import { Card, Descriptions, Button, Avatar, Typography, Skeleton, Result, message } from 'antd';
import { UserOutlined, LogoutOutlined, CalendarOutlined, MailOutlined, ManOutlined, WomanOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import SocialLinks from '@/components/SocialLinks';
import { motion } from 'framer-motion';

const { Title } = Typography;

export default function ProfilePage() {
    const router = useRouter();

    const { data: user, isLoading, error } = useQuery({
        queryKey: ['profile'],
        queryFn: async () => {
            const response = await api.get(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`);
            return response.data;
        },
        // Don't retry automatically on 401
        retry: (failureCount, error: AxiosError) => {
            if (error.response?.status === 401) return false;
            return failureCount < 3;
        },
    });

    const handleLogout = () => {
        localStorage.removeItem('token');
        message.success('Logged out successfully');
        router.push('/auth/login');
    };

    if (error) {
        if (error.response?.status === 401) {
            router.push('/auth/login');
            return null;
        }
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Result
                    status="error"
                    title="Failed to fetch profile"
                    subTitle={error.message}
                    extra={[
                        <Button type="primary" key="retry" onClick={() => window.location.reload()}>
                            Retry
                        </Button>,
                    ]}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-4xl mx-auto space-y-8"
            >
                <motion.div
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    <Card
                        title={<Title level={3} className="m-0 text-foreground!">User Profile</Title>}
                        extra={
                            <Button
                                danger
                                icon={<LogoutOutlined />}
                                onClick={handleLogout}
                                className="hover:bg-error/10!"
                            >
                                Logout
                            </Button>
                        }
                        className="shadow-xl bg-card! border-border/50 rounded-2xl! overflow-hidden"
                    >
                        {isLoading ? (
                            <Skeleton active avatar paragraph={{ rows: 4 }} />
                        ) : (
                            <div className="flex flex-col md:flex-row gap-8 py-4">
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="flex flex-col items-center"
                                >
                                    <div className="relative p-1 rounded-full bg-linear-to-br from-primary to-accent">
                                        <Avatar
                                            size={128}
                                            icon={<UserOutlined />}
                                            src={user.profilePhoto && user.profilePhoto}
                                            className="bg-card border-2 border-card"
                                        />
                                    </div>
                                    <Title level={4} className="mt-4 mb-0!">{user.name}</Title>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="grow"
                                >
                                    <Descriptions
                                        bordered
                                        column={1}
                                        className="bg-muted/20! rounded-lg overflow-hidden"
                                        style={{ fontWeight: 600, width: '120px' }}
                                    >
                                        <Descriptions.Item label={<><MailOutlined className="mr-2 text-primary" />Email</>}>
                                            <span className="font-medium">{user.email}</span>
                                        </Descriptions.Item>
                                        <Descriptions.Item label={<><UserOutlined className="mr-2 text-primary" />Name</>}>
                                            <span className="font-medium">{user.name}</span>
                                        </Descriptions.Item>
                                        <Descriptions.Item label={<><CalendarOutlined className="mr-2 text-primary" />Birth Date</>}>
                                            <span className="font-medium">{user.birthDate ? new Date(user.birthDate).toLocaleDateString() : 'Not provided'}</span>
                                        </Descriptions.Item>
                                        <Descriptions.Item
                                            label={
                                                user.gender === 'male' ? <><ManOutlined className="mr-2 text-primary" />Gender</> :
                                                    user.gender === 'female' ? <><WomanOutlined className="mr-2 text-primary" />Gender</> :
                                                        <><UserOutlined className="mr-2 text-primary" />Gender</>
                                            }
                                        >
                                            <span className="capitalize font-medium">{user.gender || 'Not provided'}</span>
                                        </Descriptions.Item>
                                    </Descriptions>
                                </motion.div>
                            </div>
                        )}
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <SocialLinks />
                </motion.div>
            </motion.div>
        </div>
    );
}
