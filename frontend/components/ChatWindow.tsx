'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CloseOutlined,
    SendOutlined,
    LoadingOutlined,
    CheckOutlined
} from '@ant-design/icons';
import { Input, Button, Avatar, Empty } from 'antd';
import { useChat } from './ChatProvider';

const ChatWindow: React.FC = () => {
    const {
        isOpen,
        closeChat,
        activeFriend,
        messages,
        sendMessage,
        loadingMessages,
        isConnected,
        isTyping,
        emitTyping,
    } = useChat();

    const [inputValue, setInputValue] = useState('');
    const [isSending, setIsSending] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const typingDebounceRef = useRef<NodeJS.Timeout | null>(null);

    const scrollToBottom = (force = false) => {
        const container = containerRef.current;
        if (!container) return;

        const isNearBottom =
            container.scrollHeight -
            container.scrollTop -
            container.clientHeight <
            100;

        if (isNearBottom || force) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom(true);
        }
    }, [isOpen]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputValue(e.target.value);

        // Debounce typing indicator
        if (typingDebounceRef.current) {
            clearTimeout(typingDebounceRef.current);
        }

        // Only emit typing if there's actual content
        if (e.target.value.trim()) {
            emitTyping();

            // Clear typing indicator after 2 seconds of inactivity
            typingDebounceRef.current = setTimeout(() => {
                // The backend will auto-expire the typing indicator
            }, 2000);
        }
    };

    const handleSend = async () => {
        if (!inputValue.trim() || isSending) return;

        try {
            setIsSending(true);
            await sendMessage(inputValue.trim());
            setInputValue('');
        } finally {
            setIsSending(false);
        }
    };

    const formattedMessages = useMemo(() => {
        return messages.map((msg, index) => {
            const prev = messages[index - 1];
            const isSameSender = prev?.senderId === msg.senderId;
            return {
                ...msg,
                isSameSender,
            };
        });
    }, [messages]);

    if (!isOpen || !activeFriend) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                className="fixed bottom-24 right-6 w-[380px] h-[580px] bg-card border border-border/50 rounded-[2.5rem] shadow-2xl backdrop-blur-3xl z-50 flex flex-col overflow-hidden"
            >
                {/* HEADER */}
                <div className="p-6 border-b border-border/50 bg-linear-to-r from-primary/10 to-accent/10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Avatar
                            size={48}
                            src={activeFriend?.user?.profilePhoto}
                            className="border-2 border-primary/20 shadow-md"
                        >
                            {activeFriend?.user?.name?.[0]}
                        </Avatar>

                        <div>
                            <h4 className="font-black text-foreground m-0 leading-tight tracking-tight">
                                {activeFriend?.user?.name}
                            </h4>

                            <span
                                className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${isConnected ? 'text-success' : 'text-warning'
                                    }`}
                            >
                                <span
                                    className={`w-1.5 h-1.5 rounded-full ${isConnected
                                        ? 'bg-success animate-pulse'
                                        : 'bg-warning'
                                        }`}
                                />
                                {isConnected ? 'Online' : 'Connecting...'}
                            </span>
                        </div>
                    </div>

                    <Button
                        type="text"
                        icon={<CloseOutlined />}
                        onClick={closeChat}
                        className="rounded-full w-10 h-10 flex items-center justify-center"
                    />
                </div>

                {/* MESSAGES */}
                <div
                    ref={containerRef}
                    className="grow overflow-y-auto p-6 space-y-2 custom-scrollbar"
                >
                    {loadingMessages ? (
                        <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-50">
                            <LoadingOutlined className="text-3xl animate-spin" />
                            <p className="text-xs font-black uppercase tracking-widest">
                                Loading Messages...
                            </p>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center px-8 opacity-40">
                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={false} />
                            <p className="text-sm font-bold mt-4">
                                No messages yet. Say hi!
                            </p>
                        </div>
                    ) : (
                        formattedMessages.map((msg, index) => {
                            const isMe =
                                msg.senderId !== activeFriend?.user?.id;

                            return (
                                <motion.div
                                    key={msg.id || index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className={`flex ${isMe ? 'justify-end' : 'justify-start'
                                        } ${msg.isSameSender ? 'mt-1' : 'mt-4'}`}
                                >
                                    <div
                                        className={`max-w-[80%] px-4 py-3 text-sm shadow-sm ${isMe
                                            ? 'bg-primary text-white'
                                            : 'bg-muted/50 text-foreground border border-border/50'
                                            }
                    ${isMe
                                                ? msg.isSameSender
                                                    ? 'rounded-2xl rounded-tr-lg'
                                                    : 'rounded-2xl rounded-tr-none'
                                                : msg.isSameSender
                                                    ? 'rounded-2xl rounded-tl-lg'
                                                    : 'rounded-2xl rounded-tl-none'
                                            }
                  `}
                                    >
                                        <div>{msg.content}</div>

                                        <div className="text-[9px] opacity-60 mt-1 text-right flex justify-end gap-1 items-center">
                                            {new Date(msg.createdAt).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}

                                            {isMe && (
                                                <CheckOutlined className="text-[9px]" />
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}

                    {isTyping && (
                        <div className="flex justify-start mt-3">
                            <div className="bg-muted/40 px-4 py-2 rounded-2xl text-xs animate-pulse">
                                {activeFriend?.user?.name} is typing...
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* INPUT */}
                <div className="p-6 border-t border-border/50 bg-card/50">
                    <div className="flex gap-3 bg-muted/30 p-2 rounded-2xl border border-border/30 focus-within:border-primary/50 transition-all">
                        <Input.TextArea
                            autoSize={{ minRows: 1, maxRows: 4 }}
                            placeholder="Type a message..."
                            value={inputValue}
                            onChange={handleInputChange}
                            onPressEnter={(e) => {
                                if (!e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            className="bg-transparent border-none shadow-none text-sm"
                        />

                        <Button
                            type="primary"
                            icon={
                                isSending ? (
                                    <LoadingOutlined />
                                ) : (
                                    <SendOutlined />
                                )
                            }
                            onClick={handleSend}
                            loading={isSending}
                            disabled={!inputValue.trim()}
                            className="rounded-xl h-10 w-10 flex items-center justify-center"
                            shape="circle"
                        />
                    </div>
                </div>

                <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: var(--border);
            border-radius: 4px;
          }
        `}</style>
            </motion.div>
        </AnimatePresence>
    );
};

export default ChatWindow;
