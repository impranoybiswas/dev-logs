'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import Pusher from 'pusher-js';
import { getChatMessages, sendMessage as sendMessageApi, ChatMessage } from '@/lib/chat';
import { FriendshipRequest } from '@/lib/user';
import { message } from '@/lib/antd';
import { jwtDecode } from 'jwt-decode';

interface TokenPayload {
    sub: string;
    email: string;
    iat: number;
    exp: number;
}

interface ChatContextType {
    socket: null;
    messages: ChatMessage[];
    activeFriend: FriendshipRequest | null;
    isOpen: boolean;
    openChat: (friend: FriendshipRequest) => void;
    closeChat: () => void;
    sendMessage: (content: string) => void;
    loadingMessages: boolean;
    isConnected: boolean;
    isTyping: boolean;
    typingUser: string | null;
    emitTyping: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [activeFriend, setActiveFriend] = useState<FriendshipRequest | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [typingUser, setTypingUser] = useState<string | null>(null);
    const pusherRef = useRef<Pusher | null>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    // FIX: use a ref to track activeFriend inside Pusher event handlers
    // so we don't need activeFriend in the useEffect dependency array
    const activeFriendRef = useRef<FriendshipRequest | null>(null);

    // Keep ref in sync with state
    useEffect(() => {
        activeFriendRef.current = activeFriend;
    }, [activeFriend]);

    const getUserId = useCallback(() => {
        const token = localStorage.getItem('token');
        if (!token) return null;
        try {
            const decoded = jwtDecode<TokenPayload>(token);
            return decoded.sub;
        } catch (e) {
            console.error('Failed to decode token', e);
            return null;
        }
    }, []);

    // FIX: removed activeFriend from dependency array — Pusher should only
    // reconnect when the logged-in user changes, not on every chat open.
    useEffect(() => {
        const userId = getUserId();
        if (!userId) return;

        const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
        const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

        if (!pusherKey || !pusherCluster) {
            console.error('Pusher configuration missing');
            return;
        }

        const pusher = new Pusher(pusherKey, {
            cluster: pusherCluster,
            forceTLS: true,
        });

        pusherRef.current = pusher;

        pusher.connection.bind('connected', () => {
            setIsConnected(true);
        });

        pusher.connection.bind('disconnected', () => {
            setIsConnected(false);
        });

        const channel = pusher.subscribe(`user-${userId}`);

        channel.bind('newMessage', (msg: ChatMessage) => {
            setMessages(prev => {
                if (prev.find(m => m.id === msg.id)) return prev;
                // Use ref instead of stale closure over activeFriend
                const currentFriend = activeFriendRef.current;
                if (currentFriend && (msg.senderId === currentFriend.user.id || msg.receiverId === currentFriend.user.id)) {
                    return [...prev, msg];
                }
                return prev;
            });
        });

        channel.bind('messageSent', (msg: ChatMessage) => {
            setMessages(prev => {
                if (prev.find(m => m.id === msg.id)) return prev;
                return [...prev, msg];
            });
        });

        channel.bind('userTyping', (data: { userId: string; userName: string }) => {
            setIsTyping(true);
            setTypingUser(data.userName);

            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            typingTimeoutRef.current = setTimeout(() => {
                setIsTyping(false);
                setTypingUser(null);
            }, 3000);
        });

        channel.bind('userStoppedTyping', () => {
            setIsTyping(false);
            setTypingUser(null);
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        });

        return () => {
            pusher.disconnect();
            pusherRef.current = null;
        };
    }, [getUserId]); // FIX: only getUserId here, not activeFriend

    const openChat = useCallback(async (friend: FriendshipRequest) => {
        setActiveFriend(friend);
        setIsOpen(true);
        setMessages([]);
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

    const emitTyping = useCallback(() => {
        if (!activeFriendRef.current || !pusherRef.current) return;

        const userId = getUserId();
        if (!userId) return;

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/typing/${activeFriendRef.current.user.id}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
            },
        }).catch(err => console.error('Failed to emit typing event', err));
    }, [getUserId]);

    const sendMessage = useCallback(async (content: string) => {
        if (activeFriendRef.current && content.trim()) {
            try {
                const sentMessage = await sendMessageApi(activeFriendRef.current.user.id, content);

                setMessages(prev => {
                    if (prev.find(m => m.id === sentMessage.id)) return prev;
                    return [...prev, sentMessage];
                });
            } catch (err) {
                message.error('Failed to send message');
                console.error(err);
            }
        }
    }, []);

    return (
        <ChatContext.Provider value={{
            socket: null,
            messages,
            activeFriend,
            isOpen,
            openChat,
            closeChat,
            sendMessage,
            loadingMessages,
            isConnected,
            isTyping,
            typingUser,
            emitTyping
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
