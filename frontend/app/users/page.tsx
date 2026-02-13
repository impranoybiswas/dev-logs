'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    UserAddOutlined,
    SearchOutlined,
    GlobalOutlined,
    LoadingOutlined,
    CheckCircleFilled
} from '@ant-design/icons';
import { message, Input, Empty, Button, Avatar } from 'antd';
import { User, getUsers, sendFriendRequest } from '@/lib/user';
import { AxiosError } from 'axios';


export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [requestingIds, setRequestingIds] = useState<Set<string>>(new Set());
    const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await getUsers();
            setUsers(data);
        } catch (error) {
            message.error('Failed to load users');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddFriend = async (userId: string) => {
        setRequestingIds((prev) => new Set(Array.from(prev).concat(userId)));
        try {
            await sendFriendRequest(userId);
            message.success('Friend request sent!');
            setSentRequests((prev) => new Set(Array.from(prev).concat(userId)));
        } catch (error: AxiosError<{ message: string }>) {
            message.error(error.response?.data?.message || 'Failed to send friend request');
        } finally {
            setRequestingIds((prev) => {
                const next = new Set(prev);
                next.delete(userId);
                return next;
            });
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
        <div className="min-h-screen bg-background p-6 md:p-12 transition-all duration-500" style={containerStyle}>
            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-7xl mx-auto mb-12"
            >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black bg-linear-to-r from-primary via-accent to-secondary bg-clip-text text-transparent mb-2">
                            Discover Developers
                        </h1>
                        <p className="text-muted-foreground text-lg flex items-center gap-2">
                            <GlobalOutlined className="text-primary" />
                            Connect with developers across the globe
                        </p>
                    </div>

                    <div className="relative w-full md:w-96">
                        <Input
                            placeholder="Search developers..."
                            prefix={<SearchOutlined className="text-muted-foreground" />}
                            size="large"
                            className="rounded-2xl border-2 border-border focus:border-primary transition-all duration-300 bg-background/50 backdrop-blur-sm"
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </motion.div>

            {/* Users Grid */}
            <div className="max-w-7xl mx-auto">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-4">
                        <LoadingOutlined className="text-5xl text-primary animate-spin" />
                        <p className="text-muted-foreground animate-pulse font-medium">Summoning developers...</p>
                    </div>
                ) : filteredUsers.length > 0 ? (
                    <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                        layout
                    >
                        <AnimatePresence mode="popLayout">
                            {filteredUsers.map((user, index) => (
                                <motion.div
                                    key={user.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                    transition={{ duration: 0.4, delay: index * 0.05 }}
                                    className="group"
                                >
                                    <div className="relative h-full bg-background/40 backdrop-blur-md rounded-3xl border border-border/50 p-6 transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-primary/30 hover:-translate-y-2 overflow-hidden flex flex-col items-center text-center">
                                        {/* Background Accent */}
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-500" />

                                        {/* Avatar */}
                                        <div className="relative mb-6">
                                            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500 scale-125" />
                                            <Avatar
                                                size={96}
                                                src={user.profilePhoto}
                                                className="border-4 border-background shadow-xl ring-4 ring-primary/10 group-hover:ring-primary/20 transition-all duration-500"
                                            >
                                                {user.name[0]}
                                            </Avatar>
                                        </div>

                                        {/* User Info */}
                                        <div className="grow w-full space-y-1 mb-6">
                                            <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300 truncate">
                                                {user.name}
                                            </h3>
                                            <p className="text-muted-foreground text-sm flex items-center justify-center gap-1">
                                                <span className="truncate">{user.email}</span>
                                            </p>
                                        </div>

                                        {/* Action Button */}
                                        <Button
                                            type={sentRequests.has(user.id) ? 'default' : 'primary'}
                                            size="large"
                                            block
                                            icon={sentRequests.has(user.id) ? <CheckCircleFilled className="text-success" /> : <UserAddOutlined />}
                                            loading={requestingIds.has(user.id)}
                                            onClick={() => handleAddFriend(user.id)}
                                            disabled={sentRequests.has(user.id)}
                                            className={`rounded-2xl font-bold h-12 transition-all duration-300 ${sentRequests.has(user.id)
                                                ? 'bg-success/10 border-success/20 text-success'
                                                : 'shadow-[0_4px_14px_0_rgba(124,58,237,0.39)] hover:shadow-[0_6px_20px_rgba(124,58,237,0.23)]'
                                                }`}
                                        >
                                            {sentRequests.has(user.id) ? 'Request Sent' : 'Add Friend'}
                                        </Button>
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
                                <span className="text-muted-foreground text-lg">
                                    No developers found matching &quot;{searchQuery}&quot;
                                </span>
                            }
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                    </motion.div>
                )}
            </div>

            {/* Custom Styles */}
            <style jsx global>{`
                .ant-input-affix-wrapper-lg {
                    padding: 0.75rem 1.25rem !important;
                }
                .ant-btn-primary {
                    background-color: var(--color-primary) !important;
                }
                .ant-btn-primary:hover {
                    background-color: var(--color-primary-hover) !important;
                }
            `}</style>
        </div>
    );
}
