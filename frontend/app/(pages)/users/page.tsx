'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    UserAddOutlined,
    SearchOutlined,
    GlobalOutlined,
    LoadingOutlined,
    CheckCircleFilled,
    CheckOutlined,
    CloseOutlined,
    MessageOutlined,
} from '@ant-design/icons';
import { Input, Empty, Button, Avatar } from 'antd';
import { message } from '@/lib/antd';
import { getUsers, sendFriendRequest, respondToFriendRequest, cancelFriendRequest, getSentRequests, getFriends } from '@/lib/user';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useChat } from '@/components/ChatProvider';
import { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';


export default function UsersPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { openChat } = useChat();
    const [searchQuery, setSearchQuery] = useState('');
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
    const [isLoggedIn] = useState(() => typeof window !== 'undefined' && !!localStorage.getItem('token'));

    const { data: users = [], isLoading: loading } = useQuery({
        queryKey: ['users'],
        queryFn: getUsers,
    });

    const { data: sentRequests = [] } = useQuery({
        queryKey: ['friendships', 'sent'],
        queryFn: getSentRequests,
        enabled: isLoggedIn,
    });

    const handleAddFriend = async (userId: string) => {
        setActionLoadingId(userId);
        try {
            await sendFriendRequest(userId);
            message.success('Friend request sent!');
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['friendships'] });
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        } catch (error: unknown) {
            const axiosError = error as AxiosError<{ message: string }>;
            message.error(axiosError.response?.data?.message || 'Failed to send friend request');
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleCancelRequest = async (userId: string) => {
        const sentReq = sentRequests.find(r => r.user.id === userId);
        if (!sentReq) return;

        setActionLoadingId(userId);
        try {
            await cancelFriendRequest(sentReq.id);
            message.success('Request cancelled');
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['friendships'] });
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        } catch {
            message.error('Failed to cancel request');
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleRespond = async (userId: string, action: 'ACCEPT' | 'REJECT') => {
        // We'd need the received friendship ID here, but our current User DTO only gives status.
        // For simplicity in the users list, let's redirect them to the friends page or just show "Respond in Friends Tab"
        // Better: let's fetch received requests and find the ID.
        const receivedData = await queryClient.fetchQuery({
            queryKey: ['friendships', 'received'],
            queryFn: () => import('@/lib/user').then(m => m.getReceivedRequests())
        });
        const req = receivedData.find(r => r.user.id === userId);
        if (!req) return;

        setActionLoadingId(userId);
        try {
            await respondToFriendRequest(req.id, action);
            message.success(`Request ${action.toLowerCase()}ed`);
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['friendships'] });
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        } catch {
            message.error('Failed to respond');
        } finally {
            setActionLoadingId(null);
        }
    };


    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const containerStyle = {
        background: 'radial-gradient(circle at top left, var(--color-primary-hover) 0%, transparent 20%), radial-gradient(circle at bottom right, var(--color-accent-hover) 0%, transparent 20%)',
    };

    return (
        <div className="page-container pt-15 md:pt-20 min-h-dvh" style={containerStyle}>
            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-7xl mx-auto mb-16 mt-8"
            >
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold border border-primary/20">
                            <GlobalOutlined />
                            <span>Global Network</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-tight">
                            Discover <span className="bg-linear-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">Developers</span>
                        </h1>
                        <p className="text-muted-foreground text-xl max-w-2xl font-medium">
                            Explore and connect with talented developers from around the world. Build your network and collaborate on amazing projects.
                        </p>
                    </div>

                    <div className="relative w-full md:max-w-md">
                        <Input
                            placeholder="Search by name or email..."
                            prefix={<SearchOutlined className="text-muted-foreground mr-2" />}
                            size="large"
                            className="h-14 md:h-16"
                            style={{
                                borderRadius: '1.25rem',
                                border: '1px solid var(--border)',
                                backgroundColor: 'var(--color-card)',
                                backdropFilter: 'blur(24px)',
                                transition: 'all 0.3s ease'
                            }}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </motion.div>

            {/* Users Grid */}
            <div className="max-w-7xl mx-auto">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse scale-150" />
                            <LoadingOutlined className="text-6xl text-primary animate-spin relative" />
                        </div>
                        <p className="text-muted-foreground animate-pulse font-bold text-lg">Summoning developers...</p>
                    </div>
                ) : filteredUsers.length > 0 ? (
                    <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                        layout
                    >
                        <AnimatePresence mode="popLayout">
                            {filteredUsers.map((user, index) => (
                                <motion.div
                                    key={user.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                    transition={{ duration: 0.5, delay: index * 0.05, ease: [0.23, 1, 0.32, 1] }}
                                    className="group"
                                >
                                    <div className="relative h-full bg-card/40 backdrop-blur-xl rounded-[2.5rem] border border-border/50 p-8 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:border-primary/50 hover:-translate-y-3 overflow-hidden flex flex-col items-center text-center">
                                        {/* Background Decoration */}
                                        <div className="absolute top-0 right-0 w-40 h-40 bg-linear-to-br from-primary/10 to-accent/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />

                                        {/* Avatar Section */}
                                        <div className="relative mb-8">
                                            <div className="absolute inset-0 bg-linear-to-br from-primary to-accent opacity-20 rounded-full blur-2xl group-hover:opacity-40 transition-all duration-500 scale-150" />
                                            <Avatar
                                                size={110}
                                                src={user?.profilePhoto}
                                                style={{
                                                    border: '4px solid var(--card)',
                                                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                                                    position: 'relative',
                                                    zIndex: 10,
                                                    transition: 'all 0.5s ease'
                                                }}
                                            >
                                                {user?.name?.[0]}
                                            </Avatar>
                                            {user.friendshipStatus === 'ACCEPTED' && (
                                                <div className="absolute -bottom-2 -right-2 bg-success text-white p-1.5 rounded-full shadow-lg border-4 border-card z-20">
                                                    <CheckOutlined className="text-xs font-black" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="grow w-full space-y-2 mb-8 relative z-10">
                                            <h3 className="text-2xl font-black text-foreground group-hover:text-primary transition-colors duration-300 truncate tracking-tight">
                                                {user.name}
                                            </h3>
                                            <div className="inline-block px-3 py-1 rounded-lg bg-muted/50 text-muted-foreground text-xs font-bold border border-border/50 transition-colors group-hover:bg-primary/5 group-hover:text-primary/70">
                                                {user.email}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="w-full mt-auto space-y-3 relative z-10">
                                            {user.friendshipStatus === 'ACCEPTED' ? (
                                                <div className="flex flex-col gap-3">
                                                    <div className="h-12 flex items-center justify-center gap-2 rounded-2xl bg-success/10 text-success font-black text-sm border border-success/20">
                                                        <CheckCircleFilled />
                                                        <span>CONNECTED</span>
                                                    </div>
                                                    <Button
                                                        block
                                                        size="large"
                                                        type="primary"
                                                        icon={<MessageOutlined />}
                                                        onClick={async () => {
                                                            const friends = await getFriends();
                                                            const friend = friends.find(f => f.user.id === user.id);
                                                            if (friend) {
                                                                openChat(friend);
                                                            }
                                                        }}
                                                        style={{
                                                            borderRadius: '1rem',
                                                            fontWeight: 900,
                                                            height: '3rem',
                                                            boxShadow: '0 10px 15px -3px rgba(var(--primary-rgb), 0.2)',
                                                            border: 'none',
                                                            backgroundColor: 'var(--primary)',
                                                            transition: 'all 0.3s ease'
                                                        }}
                                                    >
                                                        MESSAGE
                                                    </Button>
                                                </div>
                                            ) : user.friendshipStatus === 'PENDING' && user.isRequester ? (
                                                <Button
                                                    size="large"
                                                    block
                                                    danger
                                                    loading={actionLoadingId === user.id}
                                                    icon={<CloseOutlined />}
                                                    onClick={() => handleCancelRequest(user.id)}
                                                    style={{
                                                        borderRadius: '1rem',
                                                        fontWeight: 900,
                                                        height: '3rem',
                                                        boxShadow: '0 4px 6px -1px rgba(var(--error-rgb), 0.1)',
                                                        border: '2px solid rgba(var(--error-rgb), 0.2)',
                                                        transition: 'all 0.3s ease'
                                                    }}
                                                >
                                                    CANCEL REQUEST
                                                </Button>
                                            ) : user.friendshipStatus === 'PENDING' && !user.isRequester ? (
                                                <div className="flex gap-3">
                                                    <Button
                                                        type="primary"
                                                        size="large"
                                                        loading={actionLoadingId === user.id}
                                                        icon={<CheckOutlined />}
                                                        onClick={() => handleRespond(user.id, 'ACCEPT')}
                                                        style={{
                                                            borderRadius: '1rem',
                                                            fontWeight: 900,
                                                            height: '3rem',
                                                            flexGrow: 1,
                                                            boxShadow: '0 4px 6px -1px rgba(var(--success-rgb), 0.2)',
                                                            border: 'none',
                                                            backgroundColor: 'var(--color-success)',
                                                            transition: 'all 0.3s ease'
                                                        }}
                                                    >
                                                        ACCEPT
                                                    </Button>
                                                    <Button
                                                        danger
                                                        size="large"
                                                        loading={actionLoadingId === user.id}
                                                        icon={<CloseOutlined />}
                                                        onClick={() => handleRespond(user.id, 'REJECT')}
                                                        style={{
                                                            borderRadius: '1rem',
                                                            fontWeight: 900,
                                                            height: '3rem',
                                                            flexGrow: 1,
                                                            border: '2px solid rgba(var(--error-rgb), 0.2)',
                                                            transition: 'all 0.3s ease'
                                                        }}
                                                    >
                                                        DECLINE
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button
                                                    type="primary"
                                                    size="large"
                                                    block
                                                    icon={<UserAddOutlined />}
                                                    loading={actionLoadingId === user.id}
                                                    disabled={!isLoggedIn}
                                                    onClick={() => handleAddFriend(user.id)}
                                                    style={{
                                                        borderRadius: '1rem',
                                                        fontWeight: 900,
                                                        height: '3rem',
                                                        boxShadow: isLoggedIn ? '0 20px 25px -5px rgba(var(--primary-rgb), 0.2)' : 'none',
                                                        border: 'none',
                                                        transition: 'all 0.3s ease'
                                                    }}
                                                >
                                                    {isLoggedIn ? 'ADD FRIEND' : 'LOGIN TO CONNECT'}
                                                </Button>
                                            )}

                                            <Button
                                                block
                                                size="large"
                                                icon={<GlobalOutlined />}
                                                disabled={!isLoggedIn}
                                                onClick={() => router.push(`/users/${user.id}`)}
                                                style={{
                                                    borderRadius: '1rem',
                                                    height: '3rem',
                                                    border: `2px solid ${isLoggedIn ? 'rgba(var(--primary-rgb), 0.2)' : 'var(--border)'}`,
                                                    color: isLoggedIn ? 'var(--primary)' : 'var(--muted-foreground)',
                                                    fontWeight: 'bold',
                                                    transition: 'all 0.3s ease'
                                                }}
                                            >
                                                {isLoggedIn ? 'VIEW PROFILE' : 'LOGIN TO VIEW'}
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="py-32"
                    >
                        <Empty
                            description={
                                <div className="space-y-4">
                                    <p className="text-muted-foreground text-2xl font-bold">No developers found</p>
                                    <p className="text-muted-foreground/60">Try searching for a different name or email</p>
                                </div>
                            }
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                    </motion.div>
                )}
            </div>

            <style jsx global>{`
                .ant-input-affix-wrapper-lg {
                    padding: 0 1.5rem !important;
                }
                .ant-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    letter-spacing: 0.025em;
                }
            `}</style>
        </div>
    );
}
