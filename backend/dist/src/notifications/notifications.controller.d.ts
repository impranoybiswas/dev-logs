import { NotificationsService } from './notifications.service';
interface AuthenticatedRequest extends Request {
    user: {
        id: string;
        email: string;
    };
}
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    findAll(req: AuthenticatedRequest): Promise<{
        message: string;
        type: string;
        id: string;
        createdAt: Date;
        userId: string;
        requesterId: string | null;
        friendshipId: string | null;
        read: boolean;
    }[]>;
    markAsRead(id: string): Promise<{
        message: string;
        type: string;
        id: string;
        createdAt: Date;
        userId: string;
        requesterId: string | null;
        friendshipId: string | null;
        read: boolean;
    }>;
    markAllAsRead(req: AuthenticatedRequest): Promise<import("@prisma/client").Prisma.BatchPayload>;
}
export {};
