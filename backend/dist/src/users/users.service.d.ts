import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from '../auth/dto/register.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: RegisterDto): Promise<{
        email: string;
        name: string;
        profilePhoto: string | null;
        id: string;
        createdAt: Date;
    }>;
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
            name: string;
            id: string;
            url: string;
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
