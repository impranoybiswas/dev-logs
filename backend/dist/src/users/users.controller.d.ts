import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
interface AuthenticatedRequest extends Request {
    user: {
        id: string;
        email: string;
    };
}
interface RequestWithOptionalUser extends Request {
    user?: {
        id: string;
        email: string;
    };
}
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    getProfile(req: AuthenticatedRequest): Promise<import('./users.service').UserWithRelations>;
    updateProfile(req: AuthenticatedRequest, updateProfileDto: UpdateProfileDto): Promise<import('./users.service').SafeUser>;
    findAll(req: RequestWithOptionalUser): Promise<import('./users.service').SafeUser[]>;
    sendFriendRequest(req: AuthenticatedRequest, receiverId: string): Promise<{
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.FriendshipStatus;
        requesterId: string;
        receiverId: string;
    }>;
    respondToFriendRequest(req: AuthenticatedRequest, friendshipId: string, action: 'ACCEPT' | 'REJECT'): Promise<{
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.FriendshipStatus;
        requesterId: string;
        receiverId: string;
    } | {
        message: string;
    }>;
    getSentRequests(req: AuthenticatedRequest): Promise<import("./users.service").FriendshipWithUser[]>;
    getReceivedRequests(req: AuthenticatedRequest): Promise<import("./users.service").FriendshipWithUser[]>;
    getFriends(req: AuthenticatedRequest): Promise<import("./users.service").FriendshipWithUser[]>;
    unfriend(req: AuthenticatedRequest, friendshipId: string): Promise<{
        message: string;
    }>;
    getPublicProfile(userId: string): Promise<import('./users.service').UserWithRelations>;
    getDashboardStats(req: AuthenticatedRequest): Promise<{
        jobApplications: {
            status: string;
            count: number;
        }[];
        totalFriends: number;
        pendingFriends: number;
        unreadNotifications: number;
        resumeCompleteness: number;
    }>;
}
export {};
