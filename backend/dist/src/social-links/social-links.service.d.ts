import { PrismaService } from '../prisma/prisma.service';
import { CreateSocialLinkDto } from './dto/create-social-link.dto';
export declare class SocialLinksService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(userId: string, createSocialLinkDto: CreateSocialLinkDto): Promise<{
        url: string;
        name: string;
        id: string;
        userId: string;
    }>;
    findAll(userId: string): Promise<{
        url: string;
        name: string;
        id: string;
        userId: string;
    }[]>;
    update(userId: string, id: string, updateData: Partial<CreateSocialLinkDto>): Promise<{
        url: string;
        name: string;
        id: string;
        userId: string;
    }>;
    remove(userId: string, id: string): Promise<{
        url: string;
        name: string;
        id: string;
        userId: string;
    }>;
}
