'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
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
import { Badge, Popover, List, Button, Empty, Avatar } from 'antd';
import { message } from '@/lib/antd';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getNotifications, markAsRead, markAllAsRead, Notification } from '@/lib/notification';
import { respondToFriendRequest } from '@/lib/user';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function Navbar() {
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
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

    const allNavLinks = [
        { href: '/', label: 'Home' },
        { href: '/jobs', label: 'My Jobs', protected: true },
        { href: '/users', label: 'Users' },
        { href: '/friends', label: 'Friends', protected: true },
        { href: '/profile', label: 'Profile', protected: true },
    ];

    const navLinks = allNavLinks.filter(link => !link.protected || isLoggedIn);


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
        <nav className={`fixed left-0 right-0 z-50 transition-all duration-500 ease-in-out ${isScrolled
            ? 'top-4'
            : 'top-0'
            }`}>
            <div className={`mx-auto max-w-7xl transition-all duration-500 ease-in-out ${isScrolled
                ? 'bg-background/80 backdrop-blur-xl border border-border/40 shadow-xl rounded-[2.5rem] px-6 py-2 mx-4'
                : 'bg-transparent border-transparent px-4'
                }`}>
                <div className="flex items-center justify-between h-16">
                    {/* Logo Section */}
                    <Link href="/" className="flex items-center space-x-3 group cursor-pointer transition-opacity hover:opacity-80">
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
                                className="relative px-4 py-2 rounded-lg text-muted-foreground hover:text-primary transition-all duration-300 font-bold text-[13px] tracking-wide uppercase group/link cursor-pointer"
                            >
                                {link.label}
                                <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-primary scale-x-0 group-hover/link:scale-x-100 transition-transform duration-300 origin-center" />
                            </Link>
                        ))}

                        <div className="mx-4 h-6 w-px bg-border/50" />

                        <div className="flex items-center space-x-2">
                            {isLoggedIn && (
                                <Popover
                                    content={notificationContent}
                                    trigger="click"
                                    placement="bottomRight"
                                    classNames={{ root: "notification-popover" }}
                                >
                                    <button className="size-10 flex items-center justify-center rounded-full text-foreground/70 hover:text-primary hover:bg-primary/5 transition-all relative">
                                        <Badge count={unreadCount} size="small" offset={[2, -2]}>
                                            <BellOutlined className="text-xl" />
                                        </Badge>
                                    </button>
                                </Popover>
                            )}

                            {/* Theme Toggle */}
                            <button
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                className="size-10 flex items-center justify-center rounded-full text-foreground/70 hover:text-primary hover:bg-primary/5 transition-all"
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
                                        style={{ border: "1px solid var(--primary)", marginRight: "5px" }}
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
                                    <Button
                                        type="text"
                                        className="font-bold text-muted-foreground hover:text-primary transition-colors"
                                        onClick={() => router.push('/auth/login')}
                                    >
                                        Log In
                                    </Button>
                                    <Button
                                        type="primary"
                                        size="middle"
                                        className="rounded-xl font-bold shadow-md hover:shadow-primary/25 hover:-translate-y-0.2 transition-all h-10 px-6"
                                        onClick={() => router.push('/auth/register')}
                                    >
                                        Get Started
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Actions */}
                    <div className="flex items-center space-x-2 md:hidden">
                        {/* Mobile Theme Toggle */}
                        <button
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="p-2 rounded-full text-foreground/70 hover:text-primary hover:bg-primary/5 transition-all"
                            aria-label="Toggle theme"
                        >
                            {theme === 'dark' ? (
                                <SunOutlined className="text-xl" />
                            ) : (
                                <MoonOutlined className="text-xl" />
                            )}
                        </button>

                        {isLoggedIn && (
                            <Popover content={notificationContent} trigger="click" placement="bottomRight">
                                <button className="p-2 rounded-full text-foreground relative hover:bg-primary/5">
                                    <Badge count={unreadCount} size="small" offset={[2, -2]}>
                                        <BellOutlined className="text-xl" />
                                    </Badge>
                                </button>
                            </Popover>
                        )}

                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 rounded-full text-primary hover:bg-primary/5 transition-all"
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

            {/* Mobile Menu Overflow */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-40 bg-background/95 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="flex flex-col h-full pt-24 px-6 space-y-4">
                        {navLinks.map((link, idx) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block px-6 py-4 rounded-2xl text-2xl font-black tracking-tight text-foreground/60 hover:text-primary hover:bg-primary/5 transition-all opacity-0 animate-nav-slide-in"
                                style={{ animationDelay: `${idx * 0.05}s` }}
                            >
                                {link.label}
                            </Link>
                        ))}

                        <div className="pt-8 border-t border-border/50 mt-auto pb-12 space-y-4">
                            {isLoggedIn ? (
                                <Button
                                    danger
                                    block
                                    size="large"
                                    icon={<LogoutOutlined />}
                                    onClick={() => {
                                        handleLogout();
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="h-14 rounded-2xl font-black tracking-tight text-lg"
                                >
                                    LOGOUT
                                </Button>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    <Link
                                        href="/auth/login"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex items-center justify-center px-4 py-4 rounded-2xl text-foreground font-black tracking-tight bg-muted/50"
                                    >
                                        LOG IN
                                    </Link>
                                    <Link
                                        href="/auth/register"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex items-center justify-center px-4 py-4 rounded-2xl bg-primary text-white font-black tracking-tight"
                                    >
                                        SIGN UP
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </nav>
    );
}
