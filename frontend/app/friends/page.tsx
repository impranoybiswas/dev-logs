'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
    Tabs,
    List,
    Avatar,
    Button,
    Empty,
    message,
    Tag,
    Typography,
    Card,
    Badge,
    Modal
} from 'antd';
import {
    UserOutlined,
    CheckOutlined,
    CloseOutlined,
    ClockCircleOutlined,
    QuestionCircleOutlined,
    UserAddOutlined,
    GlobalOutlined
} from '@ant-design/icons';
import {
    getSentRequests,
    getReceivedRequests,
    getFriends,
    respondToFriendRequest,
    cancelFriendRequest,
    unfriend,
    FriendshipRequest
} from '@/lib/user';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;

interface RequestListProps {
    requests: FriendshipRequest[];
    type: 'sent' | 'received' | 'friends';
    onAction: (id: string, action: 'ACCEPT' | 'REJECT' | 'CANCEL' | 'UNFRIEND') => Promise<void>;
}

const RequestList = ({ requests, type, onAction }: RequestListProps) => {
    const router = useRouter();
    return (
        <List
            itemLayout="horizontal"
            dataSource={requests}
            locale={{ emptyText: <Empty description={`No ${type} requests`} image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
            renderItem={(item) => (
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                >
                    <List.Item
                        className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 mb-4 hover:shadow-lg transition-all duration-300"
                        actions={[
                            <div key="actions" className="flex flex-col gap-2 items-end">
                                <div className="flex gap-2">
                                    {type === 'received' ? (
                                        <>
                                            <Button
                                                type="primary"
                                                icon={<CheckOutlined />}
                                                onClick={() => onAction(item.id, 'ACCEPT')}
                                                className="rounded-xl shadow-md bg-success border-success"
                                            >
                                                Accept
                                            </Button>
                                            <Button
                                                danger
                                                icon={<CloseOutlined />}
                                                onClick={() => onAction(item.id, 'REJECT')}
                                                className="rounded-xl"
                                            >
                                                Reject
                                            </Button>
                                        </>
                                    ) : type === 'sent' ? (
                                        <Button
                                            danger
                                            icon={<CloseOutlined />}
                                            onClick={() => onAction(item.id, 'CANCEL')}
                                            className="rounded-xl"
                                        >
                                            Cancel
                                        </Button>
                                    ) : (
                                        <Button
                                            danger
                                            icon={<CloseOutlined />}
                                            onClick={() => {
                                                Modal.confirm({
                                                    title: 'Unfriend User',
                                                    icon: <QuestionCircleOutlined style={{ color: '#ff4d4f' }} />,
                                                    content: `Are you sure you want to remove ${item.user.name} from your friends?`,
                                                    okText: 'Yes, Unfriend',
                                                    okType: 'danger',
                                                    cancelText: 'No',
                                                    onOk: () => onAction(item.id, 'UNFRIEND'),
                                                });
                                            }}
                                            className="rounded-xl"
                                        >
                                            Unfriend
                                        </Button>
                                    )}
                                </div>
                                <Button
                                    size="small"
                                    type="text"
                                    icon={<GlobalOutlined />}
                                    onClick={() => router.push(`/users/${item.user.id}`)}
                                    className="text-primary hover:text-primary-hover font-medium"
                                >
                                    View Profile
                                </Button>
                            </div>
                        ]}
                    >
                        <List.Item.Meta
                            avatar={
                                <Badge dot={type === 'received'} status="processing">
                                    <Avatar
                                        size={64}
                                        src={item.user.profilePhoto}
                                        icon={<UserOutlined />}
                                        className="border-2 border-primary/20"
                                    />
                                </Badge>
                            }
                            title={
                                <div className="flex items-center gap-2 mb-1">
                                    <Text strong className="text-lg">{item.user.name}</Text>
                                    <Tag color={type === 'sent' ? 'blue' : type === 'received' ? 'orange' : 'green'} className="rounded-full border-none px-3">
                                        {type === 'sent' ? 'Sent' : type === 'received' ? 'Received' : 'Friend'}
                                    </Tag>
                                </div>
                            }
                            description={
                                <div className="space-y-1">
                                    <Text type="secondary">{item.user.email}</Text>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <ClockCircleOutlined />
                                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            }
                        />
                    </List.Item>
                </motion.div>
            )}
        />
    );
};

export default function FriendsPage() {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('friends');

    const { data: friends = [], isLoading: loadingFriends } = useQuery({
        queryKey: ['friendships', 'accepted'],
        queryFn: getFriends,
    });

    const { data: receivedRequests = [], isLoading: loadingReceived } = useQuery({
        queryKey: ['friendships', 'received'],
        queryFn: getReceivedRequests,
    });

    const { data: sentRequests = [], isLoading: loadingSent } = useQuery({
        queryKey: ['friendships', 'sent'],
        queryFn: getSentRequests,
    });

    const handleAction = async (id: string, action: 'ACCEPT' | 'REJECT' | 'CANCEL' | 'UNFRIEND') => {
        try {
            if (action === 'CANCEL') {
                await cancelFriendRequest(id);
                message.success('Request cancelled');
            } else if (action === 'UNFRIEND') {
                await unfriend(id);
                message.success('Friend removed');
            } else {
                await respondToFriendRequest(id, action);
                message.success(`Request ${action === 'ACCEPT' ? 'accepted' : 'rejected'}`);
            }
            queryClient.invalidateQueries({ queryKey: ['friendships'] });
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        } catch (error) {
            message.error(`Failed to ${action.toLowerCase()} request`);
            console.error(error);
        }
    };

    return (
        <div className="min-h-screen bg-background p-6 md:p-12">
            <div className="max-w-4xl mx-auto space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Title level={2} className="flex items-center gap-3">
                        <UserAddOutlined className="text-primary" />
                        Friend Requests
                    </Title>
                    <Text type="secondary" className="text-lg">
                        Manage your network and connections
                    </Text>
                </motion.div>

                <Card className="rounded-3xl shadow-xl border-border/50 bg-background/50 backdrop-blur-md overflow-hidden">
                    <Tabs
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        size="large"
                        centered
                        className="custom-tabs"
                        items={[
                            {
                                key: 'friends',
                                label: (
                                    <Badge count={friends.length} offset={[10, 0]} size="small" color="#52c41a">
                                        <span className="px-4">Friends</span>
                                    </Badge>
                                ),
                                children: (
                                    <div className="py-6 min-h-[400px]">
                                        {loadingFriends ? (
                                            <div className="flex justify-center py-20">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                                            </div>
                                        ) : (
                                            <AnimatePresence mode="wait">
                                                <RequestList requests={friends} type="friends" onAction={handleAction} />
                                            </AnimatePresence>
                                        )}
                                    </div>
                                ),
                            },
                            {
                                key: 'received',
                                label: (
                                    <Badge count={receivedRequests.length} offset={[10, 0]} size="small">
                                        <span className="px-4">Requested You</span>
                                    </Badge>
                                ),
                                children: (
                                    <div className="py-6 min-h-[400px]">
                                        {loadingReceived ? (
                                            <div className="flex justify-center py-20">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                                            </div>
                                        ) : (
                                            <AnimatePresence mode="wait">
                                                <RequestList requests={receivedRequests} type="received" onAction={handleAction} />
                                            </AnimatePresence>
                                        )}
                                    </div>
                                ),
                            },
                            {
                                key: 'sent',
                                label: (
                                    <Badge count={sentRequests.length} offset={[10, 0]} size="small" color="#1677ff">
                                        <span className="px-4">Sent Requests</span>
                                    </Badge>
                                ),
                                children: (
                                    <div className="py-6 min-h-[400px]">
                                        {loadingSent ? (
                                            <div className="flex justify-center py-20">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                                            </div>
                                        ) : (
                                            <AnimatePresence mode="wait">
                                                <RequestList requests={sentRequests} type="sent" onAction={handleAction} />
                                            </AnimatePresence>
                                        )}
                                    </div>
                                ),
                            },
                        ]}
                    />
                </Card>
            </div>


            <style jsx global>{`
                .custom-tabs .ant-tabs-nav::before {
                    border-bottom-color: var(--border) !important;
                }
                .custom-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
                    color: var(--color-primary) !important;
                    font-weight: 700 !important;
                }
                .custom-tabs .ant-tabs-ink-bar {
                    background: var(--color-primary) !important;
                    height: 3px !important;
                    border-radius: 3px 3px 0 0;
                }
            `}</style>
        </div>
    );
}
