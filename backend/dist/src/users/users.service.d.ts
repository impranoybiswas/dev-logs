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
}
