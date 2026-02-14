'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
    Tabs,
    List,
    Avatar,
    Button,
    Empty,
    Tag,
    Typography,
    Card,
    Badge,
} from 'antd';
import { message, modal } from '@/lib/antd';
import {
    UserOutlined,
    CheckOutlined,
    CloseOutlined,
    ClockCircleOutlined,
    QuestionCircleOutlined,
    UserAddOutlined,
    GlobalOutlined,
    MessageOutlined,
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
import { useChat } from '@/components/ChatProvider';

const { Title, Text } = Typography;

interface RequestListProps {
    requests: FriendshipRequest[];
    type: 'sent' | 'received' | 'friends';
    onAction: (id: string, action: 'ACCEPT' | 'REJECT' | 'CANCEL' | 'UNFRIEND') => Promise<void>;
}

const RequestList = ({ requests, type, onAction }: RequestListProps) => {
    const router = useRouter();
    const { openChat } = useChat();
    return (
        <List
            itemLayout="horizontal"
            dataSource={requests}
            locale={{ emptyText: <Empty description={`No ${type} requests`} image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
            renderItem={(item) => (
                <motion.div
                    initial={{ opacity: 0, x: -25 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    transition={{ type: "spring", stiffness: 100, damping: 15 }}
                >
                    <List.Item
                        className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-3xl p-6 mb-6 hover:shadow-2xl hover:border-primary/30 transition-all duration-300 group"
                        actions={[
                            <div key="actions" className="flex flex-col gap-3 items-end">
                                <div className="flex gap-2">
                                    {type === 'friends' && (
                                        <Button
                                            type="primary"
                                            icon={<MessageOutlined />}
                                            onClick={() => openChat(item)}
                                            className="rounded-xl shadow-lg bg-primary border-none h-10 px-6 font-bold hover:scale-105 transition-transform"
                                        >
                                            Chat
                                        </Button>
                                    )}
                                    {type === 'received' ? (
                                        <>
                                            <Button
                                                type="primary"
                                                icon={<CheckOutlined />}
                                                onClick={() => onAction(item.id, 'ACCEPT')}
                                                className="rounded-xl shadow-lg bg-success border-none h-10 px-6 font-bold hover:scale-105 transition-transform"
                                            >
                                                Accept
                                            </Button>
                                            <Button
                                                danger
                                                icon={<CloseOutlined />}
                                                onClick={() => onAction(item.id, 'REJECT')}
                                                className="rounded-xl h-10 px-6 font-bold border-2 border-error/20 hover:bg-error transition-all"
                                            >
                                                Reject
                                            </Button>
                                        </>
                                    ) : type === 'sent' ? (
                                        <Button
                                            danger
                                            icon={<CloseOutlined />}
                                            onClick={() => onAction(item.id, 'CANCEL')}
                                            className="rounded-xl h-10 px-6 font-bold border-2 border-error/20 hover:bg-error transition-all"
                                        >
                                            Cancel
                                        </Button>
                                    ) : (
                                        <Button
                                            danger
                                            icon={<CloseOutlined />}
                                            onClick={() => {
                                                modal.confirm({
                                                    title: 'Unfriend User',
                                                    icon: <QuestionCircleOutlined style={{ color: '#ef4444' }} />,
                                                    content: `Are you sure you want to remove ${item?.user?.name} from your friends?`,
                                                    okText: 'Yes, Unfriend',
                                                    okType: 'danger',
                                                    cancelText: 'No',
                                                    onOk: () => onAction(item.id, 'UNFRIEND'),
                                                    className: "rounded-3xl",
                                                });
                                            }}
                                            className="rounded-xl h-10 px-6 font-bold border-2 border-error/20 hover:bg-error transition-all"
                                        >
                                            Unfriend
                                        </Button>
                                    )}
                                </div>
                                <Button
                                    size="small"
                                    type="text"
                                    icon={<GlobalOutlined />}
                                    onClick={() => router.push(`/users/${item?.user?.id}`)}
                                    className="text-primary hover:text-primary-hover font-bold flex items-center gap-1"
                                >
                                    View Profile
                                </Button>
                            </div>
                        ]}
                    >
                        <List.Item.Meta
                            avatar={
                                <Badge dot={type === 'received'} status="processing" offset={[-5, 5]}>
                                    <Avatar
                                        size={72}
                                        src={item?.user?.profilePhoto}
                                        icon={<UserOutlined />}
                                        className="border-3 border-primary/10 shadow-lg group-hover:scale-110 transition-transform duration-500"
                                    />
                                </Badge>
                            }
                            title={
                                <div className="flex items-center gap-3 mb-2">
                                    <Text className="text-xl font-black tracking-tight text-foreground">{item?.user?.name}</Text>
                                    <Tag color={type === 'sent' ? 'blue' : type === 'received' ? 'orange' : 'green'} className="rounded-lg border-none px-3 py-0.5 font-bold uppercase text-[10px] tracking-widest bg-opacity-10">
                                        {type === 'sent' ? 'Sent' : type === 'received' ? 'Received' : 'Friend'}
                                    </Tag>
                                </div>
                            }
                            description={
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-muted-foreground/80 font-medium">
                                        <UserOutlined className="text-xs" />
                                        <span>{item?.user?.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
                                        <ClockCircleOutlined />
                                        <span>Connected on {new Date(item.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
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
    const router = useRouter();
    const queryClient = useQueryClient();

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    React.useEffect(() => {
        if (!token && typeof window !== 'undefined') {
            router.push('/auth/login');
        }
    }, [token, router]);

    const [activeTab, setActiveTab] = useState('friends');

    const { data: friends = [], isLoading: loadingFriends } = useQuery({
        queryKey: ['friendships', 'accepted'],
        queryFn: getFriends,
        enabled: !!token,
    });

    const { data: receivedRequests = [], isLoading: loadingReceived } = useQuery({
        queryKey: ['friendships', 'received'],
        queryFn: getReceivedRequests,
        enabled: !!token,
    });

    const { data: sentRequests = [], isLoading: loadingSent } = useQuery({
        queryKey: ['friendships', 'sent'],
        queryFn: getSentRequests,
        enabled: !!token,
    });

    if (!token) return null;

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
                message.success(`Request ${action.toLowerCase()}ed successfully`);
            }
            queryClient.invalidateQueries({ queryKey: ['friendships'] });
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        } catch (error) {
            message.error(`Failed to perform action`);
            console.error(error);
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] bg-background p-4 md:p-12 transition-colors duration-500">
            <div className="max-w-4xl mx-auto space-y-12">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold border border-primary/20">
                        <UserAddOutlined />
                        <span>Connections</span>
                    </div>
                    <Title level={1} className="m-0! text-3xl! sm:text-4xl! md:text-5xl! lg:text-6xl! font-black! tracking-tight!">
                        Friend <span className="bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">Requests</span>
                    </Title>
                    <Text type="secondary" className="text-xl font-medium block">
                        Build and manage your professional network
                    </Text>
                </motion.div>

                <Card className="rounded-[2.5rem] shadow-2xl border-border/40 bg-card/30 backdrop-blur-2xl overflow-hidden p-2 md:p-6 transition-all duration-500">
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
                                    <Badge count={friends.length} offset={[10, 0]} size="small" color="#10b981">
                                        <span className="px-3 md:px-6 py-2 block font-black text-xs md:text-sm uppercase tracking-widest">Friends</span>
                                    </Badge>
                                ),
                                children: (
                                    <div className="py-8 min-h-[450px]">
                                        {loadingFriends ? (
                                            <div className="flex flex-col items-center justify-center py-24 space-y-4">
                                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/10 border-t-primary" />
                                                <p className="text-muted-foreground font-bold animate-pulse">Finding your friends...</p>
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
                                    <Badge count={receivedRequests.length} offset={[10, 0]} size="small" color="#f59e0b">
                                        <span className="px-3 md:px-6 py-2 block font-black text-xs md:text-sm uppercase tracking-widest text-nowrap">Incoming</span>
                                    </Badge>
                                ),
                                children: (
                                    <div className="py-8 min-h-[450px]">
                                        {loadingReceived ? (
                                            <div className="flex flex-col items-center justify-center py-24 space-y-4">
                                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-warning/10 border-t-warning" />
                                                <p className="text-muted-foreground font-bold animate-pulse">Checking incoming requests...</p>
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
                                    <Badge count={sentRequests.length} offset={[10, 0]} size="small" color="#6366f1">
                                        <span className="px-3 md:px-6 py-2 block font-black text-xs md:text-sm uppercase tracking-widest text-nowrap">Sent</span>
                                    </Badge>
                                ),
                                children: (
                                    <div className="py-8 min-h-[450px]">
                                        {loadingSent ? (
                                            <div className="flex flex-col items-center justify-center py-24 space-y-4">
                                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/10 border-t-primary" />
                                                <p className="text-muted-foreground font-bold animate-pulse">Syncing sent requests...</p>
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
                    border-bottom-color: rgba(var(--border-rgb), 0.1) !important;
                }
                .custom-tabs .ant-tabs-tab {
                    padding: 12px 0 !important;
                    margin: 0 16px !important;
                    transition: all 0.3s ease !important;
                }
                .custom-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
                    color: var(--color-primary) !important;
                    transform: scale(1.05);
                }
                .custom-tabs .ant-tabs-ink-bar {
                    background: linear-gradient(90deg, var(--color-primary), var(--color-accent)) !important;
                    height: 4px !important;
                    border-radius: 4px 4px 0 0;
                }
                .ant-modal-content {
                    border-radius: 2rem !important;
                    padding: 2.5rem !important;
                    background: var(--color-card) !important;
                    backdrop-filter: blur(20px) !important;
                }
                .ant-modal-confirm-btns .ant-btn {
                    border-radius: 1rem !important;
                    height: 3rem !important;
                    padding: 0 2rem !important;
                    font-weight: 700 !important;
                }
            `}</style>
        </div>
    );
}
