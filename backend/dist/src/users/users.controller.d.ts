import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
interface AuthenticatedRequest extends Request {
    user: {
        userId: string;
        email: string;
    };
}
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    getProfile(req: AuthenticatedRequest): Promise<import('./users.service').UserWithRelations>;
    updateProfile(req: AuthenticatedRequest, updateProfileDto: UpdateProfileDto): Promise<import('./users.service').SafeUser>;
    findAll(req: AuthenticatedRequest): Promise<import('./users.service').SafeUser[]>;
    sendFriendRequest(req: AuthenticatedRequest, receiverId: string): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.FriendshipStatus;
        createdAt: Date;
        requesterId: string;
        receiverId: string;
    }>;
    respondToFriendRequest(req: AuthenticatedRequest, friendshipId: string, action: 'ACCEPT' | 'REJECT'): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.FriendshipStatus;
        createdAt: Date;
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
}
export {};
