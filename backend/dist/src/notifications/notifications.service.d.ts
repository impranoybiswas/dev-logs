import { PrismaService } from '../prisma/prisma.service';
export declare class NotificationsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(userId: string): Promise<{
        message: string;
        type: string;
        id: string;
        createdAt: Date;
        userId: string;
        requesterId: string | null;
        read: boolean;
    }[]>;
    markAsRead(id: string): Promise<{
        message: string;
        type: string;
        id: string;
        createdAt: Date;
        userId: string;
        requesterId: string | null;
        read: boolean;
    }>;
    markAllAsRead(userId: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
}
