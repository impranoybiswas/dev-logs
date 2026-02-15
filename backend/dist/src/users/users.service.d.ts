import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from '../auth/dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
export interface SafeUser {
    id: string;
    name: string;
    email: string;
    profilePhoto: string | null;
    gender: string | null;
    birthDate: Date | null;
    createdAt: Date;
    friendshipStatus?: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'NONE';
}
export interface UserWithRelations extends SafeUser {
    socialLinks: any[];
    jobApplications: any[];
}
export interface FriendshipWithUser {
    id: string;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    createdAt: Date;
    user: SafeUser;
}
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: RegisterDto): Promise<SafeUser>;
    findByEmail(email: string): Promise<{
        email: string;
        password: string;
        name: string;
        gender: string | null;
        birthDate: Date | null;
        profilePhoto: string | null;
        id: string;
        createdAt: Date;
    } | null>;
    findById(id: string): Promise<UserWithRelations>;
    updateProfile(id: string, data: UpdateProfileDto): Promise<SafeUser>;
    findAll(excludeUserId?: string | null): Promise<SafeUser[]>;
    sendFriendRequest(requesterId: string, receiverId: string): Promise<{
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.FriendshipStatus;
        requesterId: string;
        receiverId: string;
    }>;
    respondToFriendRequest(userId: string, friendshipId: string, action: 'ACCEPT' | 'REJECT'): Promise<{
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.FriendshipStatus;
        requesterId: string;
        receiverId: string;
    } | {
        message: string;
    }>;
    getFriendships(userId: string, type: 'SENT' | 'RECEIVED' | 'ACCEPTED'): Promise<FriendshipWithUser[]>;
    cancelFriendRequest(userId: string, friendshipId: string): Promise<{
        message: string;
    }>;
    unfriend(userId: string, friendshipId: string): Promise<{
        message: string;
    }>;
    isFriend(userId1: string, userId2: string): Promise<boolean>;
    getPublicProfile(id: string): Promise<UserWithRelations>;
    getDashboardStats(userId: string): Promise<{
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
