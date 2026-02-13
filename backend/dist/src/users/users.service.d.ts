import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from '../auth/dto/register.dto';
export interface SafeUser {
    id: string;
    name: string;
    email: string;
    profilePhoto: string | null;
    createdAt: Date;
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
    findById(id: string): Promise<{
        email: string;
        name: string;
        gender: string | null;
        birthDate: Date | null;
        profilePhoto: string | null;
        id: string;
        createdAt: Date;
        socialLinks: {
            url: string;
            name: string;
            id: string;
            userId: string;
        }[];
        jobApplications: {
            id: string;
            userId: string;
            company: string;
            role: string;
            status: string;
            appliedAt: Date;
            notes: string | null;
        }[];
    }>;
}
