'use client';

import { Card, Descriptions, Button, Avatar, Typography, Skeleton, Result, message } from 'antd';
import { UserOutlined, LogoutOutlined, CalendarOutlined, MailOutlined, ManOutlined, WomanOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';

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
        retry: (failureCount, error : AxiosError) => {
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
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <Card
                    title={<Title level={3} className="m-0">User Profile</Title>}
                    extra={
                        <Button
                            danger
                            icon={<LogoutOutlined />}
                            onClick={handleLogout}
                        >
                            Logout
                        </Button>
                    }
                    className="shadow-md"
                >
                    {isLoading ? (
                        <Skeleton active avatar paragraph={{ rows: 4 }} />
                    ) : (
                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="flex flex-col items-center">
                                <Avatar
                                    size={128}
                                    icon={<UserOutlined />}
                                    src={user.profilePhoto}
                                    className="mb-4 bg-blue-100 text-blue-500"
                                />
                                <Title level={4}>{user.name}</Title>
                            </div>

                            <div className="grow">
                                <Descriptions bordered column={1}>
                                    <Descriptions.Item label={<><MailOutlined className="mr-2" />Email</>}>
                                        {user.email}
                                    </Descriptions.Item>
                                    <Descriptions.Item label={<><UserOutlined className="mr-2" />Name</>}>
                                        {user.name}
                                    </Descriptions.Item>
                                    <Descriptions.Item label={<><CalendarOutlined className="mr-2" />Birth Date</>}>
                                        {user.birthDate ? new Date(user.birthDate).toLocaleDateString() : 'Not provided'}
                                    </Descriptions.Item>
                                    <Descriptions.Item
                                        label={
                                            user.gender === 'male' ? <><ManOutlined className="mr-2" />Gender</> :
                                                user.gender === 'female' ? <><WomanOutlined className="mr-2" />Gender</> :
                                                    <><UserOutlined className="mr-2" />Gender</>
                                        }
                                    >
                                        <span className="capitalize">{user.gender || 'Not provided'}</span>
                                    </Descriptions.Item>
                                </Descriptions>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
