'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
    MenuOutlined,
    CloseOutlined,
    SunOutlined,
    MoonOutlined,
    BellOutlined,
    CheckCircleOutlined,
    UserOutlined,
    LogoutOutlined
} from '@ant-design/icons';
import { useTheme } from 'next-themes';
import { Badge, Popover, List, Button, Empty, Avatar, message } from 'antd';
import {  useQuery, useQueryClient } from '@tanstack/react-query';
import { getNotifications, markAsRead, markAllAsRead, Notification } from '@/lib/notification';
import { respondToFriendRequest } from '@/lib/user';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function Navbar() {
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { theme, setTheme } = useTheme();
    const queryClient = useQueryClient();

    const { data: user } = useQuery({
        queryKey: ['profile'],
        queryFn: async () => {
            const response = await api.get('/users/profile');
            return response.data;
        },
        retry: false,
    });

    const isLoggedIn = !!user;

    const { data: notifications = [] } = useQuery({
        queryKey: ['notifications'],
        queryFn: getNotifications,
        refetchInterval: 30000, // Poll every 30 seconds
        enabled: isLoggedIn, // Only fetch if logged in
    });

    const unreadCount = notifications.filter(n => !n.read).length;

    const navLinks = [
        { href: '/', label: 'Home' },
        { href: '/jobs', label: 'Jobs' },
        { href: '/users', label: 'Users' },
        { href: '/friends', label: 'Friends' },
        { href: '/profile', label: 'Profile' },
    ];


    const handleMarkAsRead = async (id: string) => {
        try {
            await markAsRead(id);
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        } catch {
            message.error('Failed to mark notification as read');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead();
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            message.success('All notifications marked as read');
        } catch {
            message.error('Failed to mark all as read');
        }
    };


    const handleFriendResponse = async (notification: Notification, action: 'ACCEPT' | 'REJECT') => {
        try {
            if (!notification.requesterId) return;
            await respondToFriendRequest(notification.requesterId, action);
            message.success(`Friend request ${action === 'ACCEPT' ? 'accepted' : 'rejected'}`);
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        } catch (error) {
            message.error(`Failed to ${action.toLowerCase()} request`);
            console.error(error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        queryClient.setQueryData(['profile'], null);
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        message.success('Logged out successfully');
        router.push('/auth/login');
    };

    const notificationContent = (
        <div className="w-80">
            <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
                <span className="font-bold text-lg">Notifications</span>
                {unreadCount > 0 && (
                    <Button type="link" onClick={handleMarkAllAsRead} size="small">
                        Mark all as read
                    </Button>
                )}
            </div>
            <List
                itemLayout="horizontal"
                dataSource={notifications.slice(0, 5)}
                locale={{ emptyText: <Empty description="No notifications" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
                renderItem={(item) => (
                    <List.Item
                        className={`cursor-pointer hover:bg-muted p-2 rounded-lg transition-colors ${!item.read ? 'bg-primary/5' : ''}`}
                        onClick={() => !item.read && item.type !== 'FRIEND_REQUEST' && handleMarkAsRead(item.id)}
                    >
                        <List.Item.Meta
                            avatar={
                                <Avatar
                                    icon={item.type === 'FRIEND_REQUEST' ? <UserOutlined /> : <CheckCircleOutlined />}
                                    className={!item.read ? 'bg-primary' : 'bg-muted-foreground'}
                                />
                            }
                            title={<span className={!item.read ? 'font-bold' : ''}>{item.message}</span>}
                            description={
                                <div className="space-y-2">
                                    <p className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleDateString()}</p>
                                    {item.type === 'FRIEND_REQUEST' && !item.read && (
                                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                            <Button
                                                type="primary"
                                                size="small"
                                                className="text-xs h-7 px-3 rounded-full"
                                                onClick={() => handleFriendResponse(item, 'ACCEPT')}
                                            >
                                                Accept
                                            </Button>
                                            <Button
                                                size="small"
                                                className="text-xs h-7 px-3 rounded-full"
                                                onClick={() => handleFriendResponse(item, 'REJECT')}
                                            >
                                                Decline
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            }
                        />
                    </List.Item>
                )}
            />
            {notifications.length > 5 && (
                <div className="text-center mt-2 pt-2 border-t border-border">
                    <Link href="/notifications" className="text-primary text-sm font-medium" onClick={() => (document.body.click())}>
                        View all notifications
                    </Link>
                </div>
            )}
        </div>
    );


    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo Section */}
                    <Link href="/" className="flex items-center space-x-3 group">
                        <div className="w-9 h-9 rounded-xl bg-linear-to-br from-primary to-accent flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <span className="text-white font-black text-xl">D</span>
                        </div>
                        <span className="text-xl font-extrabold tracking-tight bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
                            Dev Logs
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="px-4 py-2 rounded-lg text-foreground/80 hover:text-primary hover:bg-primary/5 transition-all duration-200 font-semibold text-sm"
                            >
                                {link.label}
                            </Link>
                        ))}

                        <div className="mx-4 h-6 w-px bg-border/50" />

                        <div className="flex items-center space-x-2">
                            {/* Notification Bell */}
                            <Popover
                                content={notificationContent}
                                trigger="click"
                                placement="bottomRight"
                                overlayClassName="notification-popover"
                            >
                                <button className="p-2.5 rounded-xl text-foreground/70 hover:text-primary hover:bg-primary/5 transition-all relative">
                                    <Badge count={unreadCount} size="small" offset={[2, -2]}>
                                        <BellOutlined className="text-xl" />
                                    </Badge>
                                </button>
                            </Popover>

                            {/* Theme Toggle */}
                            <button
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                className="p-2.5 rounded-xl text-foreground/70 hover:text-primary hover:bg-primary/5 transition-all"
                                aria-label="Toggle theme"
                            >
                                {theme === 'dark' ? (
                                    <SunOutlined className="text-xl" />
                                ) : (
                                    <MoonOutlined className="text-xl" />
                                )}
                            </button>

                            {isLoggedIn ? (
                                <div className="ml-4 flex items-center space-x-3 pl-4 border-l border-border/50">
                                    <Avatar
                                        src={user?.profilePhoto}
                                        icon={<UserOutlined />}
                                        className="border-2 border-primary/20"
                                    />
                                    <Button
                                        danger
                                        type="text"
                                        icon={<LogoutOutlined />}
                                        onClick={handleLogout}
                                        className="font-bold hover:bg-error/5"
                                    >
                                        Logout
                                    </Button>
                                </div>
                            ) : (
                                <div className="ml-4 flex items-center space-x-3">
                                    <Link
                                        href="/auth/login"
                                        className="px-4 py-2 text-foreground/70 hover:text-primary font-bold text-sm transition-colors"
                                    >
                                        Log In
                                    </Link>
                                    <Link
                                        href="/auth/register"
                                        className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-sm transition-all shadow-md hover:shadow-primary/25 hover:-translate-y-0.5"
                                    >
                                        Get Started
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center space-x-4 md:hidden">
                        <Popover content={notificationContent} trigger="click" placement="bottomRight">
                            <button className="p-2 rounded-lg text-foreground relative">
                                <Badge count={unreadCount} size="small">
                                    <BellOutlined className="text-xl" />
                                </Badge>
                            </button>
                        </Popover>
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 rounded-lg text-foreground hover:bg-muted transition-colors"
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen ? (
                                <CloseOutlined className="text-xl" />
                            ) : (
                                <MenuOutlined className="text-xl" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-background border-t border-border">
                    <div className="px-4 py-4 space-y-3">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block px-4 py-2 rounded-lg text-foreground/80 hover:text-primary hover:bg-muted transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}
                        {isLoggedIn ? (
                            <Button
                                danger
                                block
                                icon={<LogoutOutlined />}
                                onClick={() => {
                                    handleLogout();
                                    setIsMobileMenuOpen(false);
                                }}
                                className="h-10 rounded-lg font-medium border-none"
                            >
                                Logout
                            </Button>
                        ) : (
                            <>
                                <Link
                                    href="/auth/login"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block px-4 py-2 rounded-lg text-foreground/80 hover:text-primary hover:bg-muted transition-colors text-center font-medium"
                                >
                                    Log In
                                </Link>
                                <Link
                                    href="/auth/register"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block w-full px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground text-center font-medium transition-all"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
