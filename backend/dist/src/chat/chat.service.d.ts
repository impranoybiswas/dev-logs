import { PrismaService } from '../prisma/prisma.service';
export interface ChatMessageResponse {
    id: string;
    content: string;
    senderId: string;
    receiverId: string;
    createdAt: Date;
}
export declare class ChatService {
    private prisma;
    constructor(prisma: PrismaService);
    saveMessage(senderId: string, receiverId: string, content: string): Promise<ChatMessageResponse>;
    getMessages(userId1: string, userId2: string): Promise<ChatMessageResponse[]>;
}
