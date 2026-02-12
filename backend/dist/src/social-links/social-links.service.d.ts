import { PrismaService } from '../prisma/prisma.service';
import { CreateSocialLinkDto } from './dto/create-social-link.dto';
export declare class SocialLinksService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, createSocialLinkDto: CreateSocialLinkDto): Promise<{
        id: string;
        name: string;
        url: string;
        userId: string;
    }>;
    findAll(userId: string): Promise<{
        id: string;
        name: string;
        url: string;
        userId: string;
    }[]>;
    update(userId: string, id: string, updateData: Partial<CreateSocialLinkDto>): Promise<{
        id: string;
        name: string;
        url: string;
        userId: string;
    }>;
    remove(userId: string, id: string): Promise<{
        id: string;
        name: string;
        url: string;
        userId: string;
    }>;
}
