'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CloseOutlined, SendOutlined, LoadingOutlined } from '@ant-design/icons';
import { Input, Button, Avatar, Empty } from 'antd';
import { useChat } from './ChatProvider';

const ChatWindow: React.FC = () => {
    const { isOpen, closeChat, activeFriend, messages, sendMessage, loadingMessages } = useChat();
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSend = () => {
        if (inputValue.trim()) {
            sendMessage(inputValue);
            setInputValue('');
        }
    };

    if (!isOpen || !activeFriend) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, x: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20, x: 20 }}
            className="fixed bottom-24 right-6 w-[380px] h-[580px] bg-card border border-border/50 rounded-[2.5rem] shadow-2xl backdrop-blur-3xl z-1000 flex flex-col overflow-hidden"
        >
            {/* Header */}
            <div className="p-6 border-b border-border/50 bg-linear-to-r from-primary/10 to-accent/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Avatar size={48} src={activeFriend?.user?.profilePhoto} className="border-2 border-primary/20 shadow-md">
                        {activeFriend?.user?.name?.[0]}
                    </Avatar>
                    <div>
                        <h4 className="font-black text-foreground m-0 leading-tight tracking-tight">{activeFriend?.user?.name}</h4>
                        <span className="text-[10px] text-success font-black uppercase tracking-widest flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                            Online
                        </span>
                    </div>
                </div>
                <Button
                    type="text"
                    icon={<CloseOutlined className="text-muted-foreground hover:text-foreground transition-colors" />}
                    onClick={closeChat}
                    className="hover:bg-muted/50 rounded-full w-10 h-10 flex items-center justify-center p-0"
                />
            </div>

            {/* Messages Area */}
            <div className="grow overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {loadingMessages ? (
                    <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-50">
                        <LoadingOutlined className="text-3xl text-primary animate-spin" />
                        <p className="text-xs font-black uppercase tracking-widest">Encrypting Chat...</p>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center px-8 opacity-40">
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={false} />
                        <p className="text-sm font-bold mt-4">No messages yet. Say hi to start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isMe = msg.senderId !== activeFriend?.user?.id;
                        return (
                            <motion.div
                                key={msg.id || index}
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm transition-all shadow-sm ${isMe
                                        ? 'bg-primary text-white rounded-tr-none shadow-primary/20 font-medium'
                                        : 'bg-muted/50 text-foreground rounded-tl-none border border-border/50'
                                        }`}
                                >
                                    {msg.content}
                                </div>
                            </motion.div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-border/50 bg-card/50">
                <div className="flex gap-3 bg-muted/30 p-2 rounded-2xl border border-border/30 focus-within:border-primary/50 transition-all duration-300">
                    <Input.TextArea
                        autoSize={{ minRows: 1, maxRows: 4 }}
                        placeholder="Message..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onPressEnter={(e) => {
                            if (!e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        className="bg-transparent border-none shadow-none focus:ring-0 text-sm py-2 px-2 custom-scrollbar"
                    />
                    <Button
                        type="primary"
                        icon={<SendOutlined />}
                        onClick={handleSend}
                        className="rounded-xl h-10 w-10 flex items-center justify-center shadow-lg shadow-primary/20 border-none hover:scale-105 active:scale-95 transition-all p-0"
                    />
                </div>
            </div>

            <style jsx global>{`
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
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: var(--muted-foreground);
                }
            `}</style>
        </motion.div>
    );
};

export default ChatWindow;
