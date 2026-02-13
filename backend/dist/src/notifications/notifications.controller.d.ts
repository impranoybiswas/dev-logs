import { NotificationsService } from './notifications.service';
interface AuthenticatedRequest extends Request {
    user: {
        userId: string;
        email: string;
    };
}
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    findAll(req: AuthenticatedRequest): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        requesterId: string | null;
        type: string;
        message: string;
        read: boolean;
    }[]>;
    markAsRead(id: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        requesterId: string | null;
        type: string;
        message: string;
        read: boolean;
    }>;
    markAllAsRead(req: AuthenticatedRequest): Promise<import("@prisma/client").Prisma.BatchPayload>;
}
export {};
