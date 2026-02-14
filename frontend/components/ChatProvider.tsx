'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { getChatMessages, ChatMessage } from '@/lib/chat';
import { FriendshipRequest } from '@/lib/user';
import { message } from '@/lib/antd';

interface ChatContextType {
    socket: Socket | null;
    messages: ChatMessage[];
    activeFriend: FriendshipRequest | null;
    isOpen: boolean;
    openChat: (friend: FriendshipRequest) => void;
    closeChat: () => void;
    sendMessage: (content: string) => void;
    loadingMessages: boolean;
    isConnected: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [activeFriend, setActiveFriend] = useState<FriendshipRequest | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const newSocket = io(socketUrl, {
            auth: { token },
            transports: ['websocket'],
        });

        newSocket.on('connect', () => {
            console.log('Connected to chat server');
            setIsConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('Disconnected from chat server');
            setIsConnected(false);
        });

        newSocket.on('error', (err: string) => {
            message.error(err);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, []);

    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (msg: ChatMessage) => {
            if (activeFriend && (msg.senderId === activeFriend.user.id || msg.receiverId === activeFriend.user.id)) {
                setMessages(prev => [...prev, msg]);
            }
        };

        const handleMessageSent = (msg: ChatMessage) => {
            setMessages(prev => [...prev, msg]);
        };

        socket.on('newMessage', handleNewMessage);
        socket.on('messageSent', handleMessageSent);

        return () => {
            socket.off('newMessage', handleNewMessage);
            socket.off('messageSent', handleMessageSent);
        };
    }, [socket, activeFriend]);

    const openChat = useCallback(async (friend: FriendshipRequest) => {
        setActiveFriend(friend);
        setIsOpen(true);
        setLoadingMessages(true);
        try {
            const history = await getChatMessages(friend.user.id);
            setMessages(history);
        } catch {
            message.error('Failed to load chat history');
        } finally {
            setLoadingMessages(false);
        }
    }, []);

    const closeChat = useCallback(() => {
        setIsOpen(false);
        setActiveFriend(null);
        setMessages([]);
    }, []);

    const sendMessage = useCallback((content: string) => {
        if (socket && activeFriend && content.trim()) {
            socket.emit('sendMessage', {
                receiverId: activeFriend.user.id,
                content,
            });
        }
    }, [socket, activeFriend]);

    return (
        <ChatContext.Provider value={{
            socket,
            messages,
            activeFriend,
            isOpen,
            openChat,
            closeChat,
            sendMessage,
            loadingMessages,
            isConnected
        }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};
