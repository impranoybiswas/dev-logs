'use client';

import { Card, Descriptions, Button, Avatar, Typography, Skeleton, Result } from 'antd';
import { UserOutlined, CalendarOutlined, MailOutlined, ManOutlined, WomanOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import SocialLinks from '@/components/SocialLinks';
import { motion } from 'framer-motion';
import { getUserProfile } from '@/lib/user';

const { Title, Text } = Typography;

export default function UserProfilePage() {
    const router = useRouter();
    const params = useParams();
    const userId = params.id as string;

    const { data: user, isLoading, error } = useQuery({
        queryKey: ['user-profile', userId],
        queryFn: () => getUserProfile(userId),
        retry: (failureCount, error: AxiosError) => {
            if (error.response?.status === 404) return false;
            return failureCount < 3;
        },
    });

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
                <Result
                    status="error"
                    title="User not found"
                    subTitle={(error as AxiosError<{ message: string }>)?.response?.data?.message || error.message}
                    extra={[
                        <Button type="primary" key="back" icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
                            Go Back
                        </Button>,
                    ]}
                />
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-64px)] bg-background p-4 md:p-8">
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
                        title={
                            <div className="flex items-center gap-4">
                                <Button
                                    type="text"
                                    icon={<ArrowLeftOutlined />}
                                    onClick={() => router.back()}
                                    className="hover:bg-muted"
                                />
                                <Title level={3} className="m-0 text-foreground!">User Profile</Title>
                            </div>
                        }
                        className="shadow-xl bg-card! border-border/50 rounded-2xl! overflow-hidden"
                    >
                        {isLoading ? (
                            <Skeleton active avatar paragraph={{ rows: 4 }} />
                        ) : user ? (
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
                                            src={user.profilePhoto}
                                            className="bg-card border-2 border-card"
                                        />
                                    </div>
                                    <Title level={4} className="mt-4 mb-0!">{user.name}</Title>
                                    <Text type="secondary" className="mt-1">Developer</Text>
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
                        ) : null}
                    </Card>
                </motion.div>

                {user && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <SocialLinks links={user.socialLinks} editable={false} />
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
