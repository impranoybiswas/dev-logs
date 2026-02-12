import { PrismaService } from '../prisma/prisma.service';
import { CreateSocialLinkDto } from './dto/create-social-link.dto';
export declare class SocialLinksService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, createSocialLinkDto: CreateSocialLinkDto): Promise<{
        name: string;
        id: string;
        url: string;
        userId: string;
    }>;
    findAll(userId: string): Promise<{
        name: string;
        id: string;
        url: string;
        userId: string;
    }[]>;
    remove(userId: string, id: string): Promise<{
        name: string;
        id: string;
        url: string;
        userId: string;
    }>;
}
