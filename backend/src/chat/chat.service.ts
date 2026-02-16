import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

export interface ChatMessageResponse {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: Date;
}

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {}

  private getChatKey(userId1: string, userId2: string): string {
    const [minId, maxId] = [userId1, userId2].sort();
    return `chat:${minId}:${maxId}`;
  }

  async saveMessage(
    senderId: string,
    receiverId: string,
    content: string,
  ): Promise<ChatMessageResponse> {
    const message = await this.prisma.chatMessage.create({
      data: {
        content,
        senderId,
        receiverId,
      },
    });

    // Invalidate cache
    const key = this.getChatKey(senderId, receiverId);
    await this.redisService.del(key);

    return message;
  }

  async getMessages(
    userId1: string,
    userId2: string,
  ): Promise<ChatMessageResponse[]> {
    const key = this.getChatKey(userId1, userId2);
    const cachedMessages = (await this.redisService.get(key)) as
      | ChatMessageResponse[]
      | null;

    if (cachedMessages) {
      return cachedMessages;
    }

    const messages = await this.prisma.chatMessage.findMany({
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

    await this.redisService.set(key, messages, 3600); // Cache for 1 hour
    return messages;
  }
}
