import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
export interface ChatMessageResponse {
    id: string;
    content: string;
    senderId: string;
    receiverId: string;
    createdAt: Date;
}
export declare class ChatService {
    private prisma;
    private redisService;
    constructor(prisma: PrismaService, redisService: RedisService);
    private getChatKey;
    saveMessage(senderId: string, receiverId: string, content: string): Promise<ChatMessageResponse>;
    getMessages(userId1: string, userId2: string): Promise<ChatMessageResponse[]>;
}
