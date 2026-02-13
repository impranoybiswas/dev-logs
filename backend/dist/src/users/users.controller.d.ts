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
        createdAt: Date;
        status: import("@prisma/client").$Enums.FriendshipStatus;
        requesterId: string;
        receiverId: string;
    }>;
}
export {};
