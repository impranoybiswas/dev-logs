import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ChatMessageResponse {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: Date;
}

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async saveMessage(
    senderId: string,
    receiverId: string,
    content: string,
  ): Promise<ChatMessageResponse> {
    return await this.prisma.chatMessage.create({
      data: {
        content,
        senderId,
        receiverId,
      },
    });
  }

  async getMessages(
    userId1: string,
    userId2: string,
  ): Promise<ChatMessageResponse[]> {
    return await this.prisma.chatMessage.findMany({
      where: {
        OR: [
          { senderId: userId1, receiverId: userId2 },
          { senderId: userId2, receiverId: userId1 },
        ],
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }
}
