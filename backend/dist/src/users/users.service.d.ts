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
}
export interface UserWithRelations extends SafeUser {
    socialLinks: any[];
    jobApplications: any[];
}
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: RegisterDto): Promise<SafeUser>;
    findByEmail(email: string): Promise<{
        id: string;
        email: string;
        name: string;
        password: string;
        profilePhoto: string | null;
        gender: string | null;
        birthDate: Date | null;
        createdAt: Date;
    } | null>;
    findById(id: string): Promise<UserWithRelations>;
    updateProfile(id: string, data: UpdateProfileDto): Promise<SafeUser>;
    findAll(excludeUserId: string): Promise<SafeUser[]>;
    sendFriendRequest(requesterId: string, receiverId: string): Promise<{
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.FriendshipStatus;
        requesterId: string;
        receiverId: string;
    }>;
}
