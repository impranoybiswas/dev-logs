'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageOutlined, CloseOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Badge, Popover, List, Avatar, Empty } from 'antd';
import { useChat } from './ChatProvider';
import { useQuery } from '@tanstack/react-query';
import { getFriends, FriendshipRequest } from '@/lib/user';

const ChatFloatingButton: React.FC = () => {
    const { isOpen, closeChat, openChat } = useChat();
    const [popoverVisible, setPopoverVisible] = useState(false);

    const { data: friends = [], isLoading: loadingFriends } = useQuery({
        queryKey: ['friendships', 'accepted'],
        queryFn: getFriends,
    });

    const handleToggle = () => {
        if (isOpen) {
            closeChat();
        } else {
            setPopoverVisible(!popoverVisible);
        }
    };

    const handleFriendSelect = (friend: FriendshipRequest) => {
        openChat(friend);
        setPopoverVisible(false);
    };

    const friendListContent = (
        <div className="w-[320px] max-h-[400px] flex flex-col p-4">
            <h4 className="text-lg font-black tracking-tight mb-4 flex items-center gap-2">
                <MessageOutlined className="text-primary" />
                Select a Connection
            </h4>
            <div className="grow overflow-y-auto custom-scrollbar">
                {loadingFriends ? (
                    <div className="py-12 flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary/10 border-t-primary" />
                    </div>
                ) : friends.length === 0 ? (
                    <Empty description="No friends connected yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                ) : (
                    <List
                        dataSource={friends}
                        renderItem={(item: FriendshipRequest) => (
                            <List.Item
                                style={{
                                    cursor: 'pointer',
                                    borderRadius: '1rem',
                                    padding: '12px',
                                    border: 'none',
                                    marginBottom: '8px',
                                    transition: 'all 0.3s'
                                }}
                                className="hover:bg-muted/50 group"
                                onClick={() => handleFriendSelect(item)}
                            >
                                <List.Item.Meta
                                    avatar={
                                        <Avatar
                                            src={item?.user?.profilePhoto}
                                            icon={<UserOutlined />}
                                            style={{
                                                transition: 'transform 0.3s',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                            }}
                                            className="group-hover:scale-110"
                                        />
                                    }
                                    title={<span className="font-bold group-hover:text-primary transition-colors">{item?.user?.name}</span>}
                                    description={<span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">{item?.user?.gender || 'Developer'}</span>}
                                />
                                <div className="w-2 h-2 rounded-full bg-success opacity-0 group-hover:opacity-100 transition-opacity" />
                            </List.Item>
                        )}
                    />
                )}
            </div>
        </div>
    );

    return (
        <div className="fixed bottom-8 right-8 z-1001">
            <Popover
                content={friendListContent}
                trigger="click"
                open={popoverVisible && !isOpen}
                onOpenChange={setPopoverVisible}
                placement="topLeft"
                classNames={{ root: 'chat-popover' }}
                arrow={false}
            >
                <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <Badge count={0} offset={[-5, 5]} size="small">
                        <Button
                            type="primary"
                            size="large"
                            shape="circle"
                            onClick={handleToggle}

                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: 'none',
                                fontSize: '1.5rem',
                                transition: 'all 0.5s ease-in-out',
                                backgroundColor: (isOpen || popoverVisible) ? 'var(--foreground)' : 'var(--primary)',
                                transform: (isOpen || popoverVisible) ? 'scale(0.9) rotate(90deg)' : 'scale(1) rotate(0deg)',
                                boxShadow: '0 25px 50px -12px rgba(var(--primary-rgb), 0.4)',
                                width: '64px',
                                height: '64px'
                            }}
                            icon={isOpen || popoverVisible ? <CloseOutlined /> : <MessageOutlined />}
                        />
                    </Badge>
                </motion.div>
            </Popover>

            <style jsx global>{`
                .chat-popover .ant-popover-inner {
                    border-radius: 2rem !important;
                    padding: 0 !important;
                    background: var(--color-card) !important;
                    backdrop-filter: blur(20px) !important;
                    border: 1px solid var(--border) !important;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: var(--border);
                    border-radius: 4px;
                }
            `}</style>
        </div>
    );
};

export default ChatFloatingButton;
