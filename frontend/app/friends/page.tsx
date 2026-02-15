'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
    Tabs,
    Row,
    Col,
    Avatar,
    Button,
    Empty,
    Tag,
    Typography,
    Card,
    Badge,
    Skeleton,
} from 'antd';
import { message, modal } from '@/lib/antd';
import {
    UserOutlined,
    CheckOutlined,
    CloseOutlined,
    QuestionCircleOutlined,
    UserAddOutlined,
    GlobalOutlined,
    MessageOutlined,
    SafetyCertificateOutlined,
    CalendarOutlined,
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
    loading?: boolean;
}

const RequestList = ({ requests, type, onAction, loading }: RequestListProps) => {
    const router = useRouter();
    const { openChat } = useChat();

    if (loading) {
        return (
            <Row gutter={[24, 24]}>
                {[1, 2, 3, 4].map((i) => (
                    <Col xs={24} sm={12} lg={8} xl={6} key={i}>
                        <Card className="rounded-[2.5rem] overflow-hidden border-border/50 bg-card/20 backdrop-blur-xl h-full p-4">
                            <Skeleton avatar active paragraph={{ rows: 3 }} />
                        </Card>
                    </Col>
                ))}
            </Row>
        );
    }

    if (requests.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 bg-card/10 backdrop-blur-sm rounded-[3rem] border border-dashed border-border/50">
                <Empty
                    description={<span className="text-muted-foreground font-black uppercase tracking-widest">No {type} requests</span>}
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
            </div>
        );
    }

    return (
        <Row gutter={[24, 24]}>
            <AnimatePresence mode="popLayout">
                {requests.map((item, index) => (
                    <Col xs={24} sm={12} lg={8} xl={6} key={item.id}>
                        <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                            transition={{ type: "spring", stiffness: 100, damping: 15, delay: index * 0.05 }}
                            className="h-full group"
                        >
                            <Card
                                className="h-full rounded-[2.5rem] border-border/50 bg-card/40 backdrop-blur-2xl hover:shadow-[0_20px_60px_-15px_rgba(var(--primary-rgb),0.15)] hover:border-primary/50 transition-all duration-500 overflow-hidden relative"

                                style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column' }}
                            >
                                {/* Background Gradient Decoration */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-primary/10 to-accent/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700 -z-1" />

                                <div className="flex flex-col items-center text-center">
                                    <Badge dot={type === 'received'} status="processing" offset={[-8, 8]} className="mb-6">
                                        <div className="relative p-1 rounded-full bg-linear-to-br from-primary/20 to-accent/20 border border-primary/10 shadow-xl group-hover:scale-110 transition-transform duration-500">
                                            <Avatar
                                                size={100}
                                                src={item?.user?.profilePhoto}
                                                icon={<UserOutlined />}
                                                className="border-4 border-card shadow-inner"
                                            />
                                        </div>
                                    </Badge>

                                    <div className="space-y-1 mb-6 w-full">
                                        <div className="flex items-center justify-center gap-2">
                                            <Title level={4} className="m-0! font-black! tracking-tight! text-foreground group-hover:text-primary transition-colors">
                                                {item?.user?.name}
                                            </Title>
                                            {type === 'friends' && <SafetyCertificateOutlined className="text-success text-sm" />}
                                        </div>
                                        <Text className="text-muted-foreground font-bold text-xs bg-muted/30 px-3 py-1 rounded-full border border-border/50 truncate w-full block">
                                            {item?.user?.email}
                                        </Text>
                                    </div>

                                    <div className="flex items-center justify-center gap-4 py-3 px-4 rounded-2xl bg-muted/20 border border-border/40 mb-8 w-full group-hover:bg-primary/5 transition-colors">
                                        <div className="flex flex-col items-center">
                                            <CalendarOutlined className="text-[10px] text-muted-foreground font-black mb-1" />
                                            <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/80">
                                                {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                                            </span>
                                        </div>
                                        <div className="w-px h-6 bg-border/50" />
                                        <div className="flex flex-col items-center">
                                            <Tag color={type === 'sent' ? 'blue' : type === 'received' ? 'orange' : 'green'} className="m-0 rounded-lg border-none px-2 py-0.5 font-black uppercase text-[9px] tracking-widest bg-opacity-10">
                                                {type === 'sent' ? 'Sent' : type === 'received' ? 'Incoming' : 'Friend'}
                                            </Tag>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-auto space-y-3 w-full">
                                    {type === 'friends' && (
                                        <Button
                                            block
                                            type="primary"
                                            icon={<MessageOutlined />}
                                            onClick={() => openChat(item)}
                                            className="rounded-2xl h-11 font-black uppercase text-xs tracking-widest shadow-lg shadow-primary/20 hover:scale-102 active:scale-98 transition-all border-none"
                                        >
                                            Start Chat
                                        </Button>
                                    )}

                                    {type === 'received' ? (
                                        <div className="flex gap-2">
                                            <Button
                                                flex-1={1}
                                                type="primary"
                                                icon={<CheckOutlined />}
                                                onClick={() => onAction(item.id, 'ACCEPT')}
                                                className="rounded-2xl h-11 font-black uppercase text-[10px] tracking-widest bg-success border-none shadow-lg shadow-success/20 hover:scale-102 active:scale-98 transition-all"
                                            >
                                                Accept
                                            </Button>
                                            <Button
                                                flex-1={1}
                                                danger
                                                icon={<CloseOutlined />}
                                                onClick={() => onAction(item.id, 'REJECT')}
                                                className="rounded-2xl h-11 font-black uppercase text-[10px] tracking-widest border-2 border-error/20 hover:bg-error/10 transition-all"
                                            >
                                                Decline
                                            </Button>
                                        </div>
                                    ) : type === 'sent' ? (
                                        <Button
                                            block
                                            danger
                                            icon={<CloseOutlined />}
                                            onClick={() => onAction(item.id, 'CANCEL')}
                                            className="rounded-2xl h-11 font-black uppercase text-xs tracking-widest border-2 border-error/20 hover:bg-error/10 transition-all"
                                        >
                                            Cancel Request
                                        </Button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <Button
                                                flex-1={1}
                                                icon={<GlobalOutlined />}
                                                onClick={() => router.push(`/users/${item?.user?.id}`)}
                                                className="rounded-2xl h-11 font-black uppercase text-[10px] tracking-widest border-2 border-primary/20 text-primary hover:bg-primary/5 transition-all"
                                            >
                                                Profile
                                            </Button>
                                            <Button
                                                flex-1={1}

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
                                                className="rounded-2xl h-11 font-black uppercase text-[10px] tracking-widest border-2 border-error/20 hover:bg-error transition-all"
                                            >
                                                Unfriend
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </motion.div>
                    </Col>
                ))}
            </AnimatePresence>
        </Row>
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
        <div className="min-h-[calc(100vh-64px)] bg-background p-4 md:p-8 lg:p-12 transition-colors duration-500 overflow-hidden">
            <div className="max-w-7xl mx-auto space-y-16">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-8"
                >
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest border border-primary/20">
                            <UserAddOutlined />
                            <span>Your Network</span>
                        </div>
                        <Title level={1} className="m-0! text-3xl! sm:text-4xl! md:text-5xl! lg:text-7xl! font-black! tracking-tight! leading-none!">
                            Professional <span className="bg-linear-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">Connections</span>
                        </Title>
                        <Text type="secondary" className="text-lg md:text-xl font-medium block max-w-2xl opacity-80">
                            Expand your horizons and collaborate with fellow developers. Manage your connections and incoming requests in one place.
                        </Text>
                    </div>
                </motion.div>

                <div className="relative">
                    {/* Background Blur Decoration */}
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
                    <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

                    <Card className="rounded-[3rem] shadow-[0_32px_100px_-20px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_100px_-20px_rgba(0,0,0,0.3)] border-border/40 bg-card/30 backdrop-blur-3xl overflow-hidden p-0 md:p-8 transition-all duration-500 z-10">
                        <Tabs
                            activeKey={activeTab}
                            onChange={setActiveTab}
                            size="large"
                            className="custom-tabs"
                            items={[
                                {
                                    key: 'friends',
                                    label: (
                                        <div className="flex items-center gap-3 px-6 py-2">
                                            <span className="font-black text-xs md:text-sm uppercase tracking-widest">Friends</span>
                                            <Badge count={friends.length} size="small" color="var(--primary)" className="scale-90" />
                                        </div>
                                    ),
                                    children: (
                                        <div className="py-10 min-h-[500px]">
                                            <RequestList requests={friends} type="friends" onAction={handleAction} loading={loadingFriends} />
                                        </div>
                                    ),
                                },
                                {
                                    key: 'received',
                                    label: (
                                        <div className="flex items-center gap-3 px-6 py-2">
                                            <span className="font-black text-xs md:text-sm uppercase tracking-widest">Incoming</span>
                                            <Badge count={receivedRequests.length} size="small" color="var(--accent)" className="scale-90" />
                                        </div>
                                    ),
                                    children: (
                                        <div className="py-10 min-h-[500px]">
                                            <RequestList requests={receivedRequests} type="received" onAction={handleAction} loading={loadingReceived} />
                                        </div>
                                    ),
                                },
                                {
                                    key: 'sent',
                                    label: (
                                        <div className="flex items-center gap-3 px-6 py-2">
                                            <span className="font-black text-xs md:text-sm uppercase tracking-widest">Sent</span>
                                            <Badge count={sentRequests.length} size="small" color="var(--secondary)" className="scale-90" />
                                        </div>
                                    ),
                                    children: (
                                        <div className="py-10 min-h-[500px]">
                                            <RequestList requests={sentRequests} type="sent" onAction={handleAction} loading={loadingSent} />
                                        </div>
                                    ),
                                },
                            ]}
                        />
                    </Card>
                </div>
            </div>

            <style jsx global>{`
                .custom-tabs .ant-tabs-nav {
                    background: rgba(var(--muted-rgb), 0.05);
                    border-radius: 2rem;
                    padding: 0.5rem;
                    border-bottom: none !important;
                    margin-bottom: 2rem !important;
                }
                .custom-tabs .ant-tabs-nav::before {
                    display: none !important;
                }
                .custom-tabs .ant-tabs-tab {
                    padding: 8px 0 !important;
                    margin: 0 4px !important;
                    transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1) !important;
                    border-radius: 1.5rem !important;
                }
                .custom-tabs .ant-tabs-tab-active {
                    background: var(--color-card) !important;
                    box-shadow: 0 10px 30px -10px rgba(0,0,0,0.1) !important;
                }
                .custom-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
                    color: var(--color-primary) !important;
                    transform: scale(1.02);
                }
                .custom-tabs .ant-tabs-ink-bar {
                    display: none !important;
                }
                .ant-modal-content {
                    border-radius: 3rem !important;
                    padding: 3rem !important;
                    background: var(--color-card) !important;
                    backdrop-filter: blur(24px) !important;
                    border: 1px solid var(--border);
                }
                .ant-modal-confirm-title {
                    font-size: 1.5rem !important;
                    font-weight: 900 !important;
                    letter-spacing: -0.025em !important;
                }
                .ant-modal-confirm-btns .ant-btn {
                    border-radius: 1.25rem !important;
                    height: 3.5rem !important;
                    padding: 0 2.5rem !important;
                    font-weight: 800 !important;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    font-size: 0.75rem;
                }
            `}</style>
        </div>
    );
}
