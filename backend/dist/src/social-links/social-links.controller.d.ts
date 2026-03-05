import { SocialLinksService } from './social-links.service';
import { CreateSocialLinkDto } from './dto/create-social-link.dto';
interface AuthenticatedRequest extends Request {
    user: {
        id: string;
        email: string;
    };
}
export declare class SocialLinksController {
    private readonly socialLinksService;
    constructor(socialLinksService: SocialLinksService);
    create(req: AuthenticatedRequest, createSocialLinkDto: CreateSocialLinkDto): Promise<{
        id: string;
        name: string;
        url: string;
        userId: string;
    }>;
    findAll(req: AuthenticatedRequest): Promise<{
        id: string;
        name: string;
        url: string;
        userId: string;
    }[]>;
    update(req: AuthenticatedRequest, id: string, updateSocialLinkDto: Partial<CreateSocialLinkDto>): Promise<{
        id: string;
        name: string;
        url: string;
        userId: string;
    }>;
    remove(req: AuthenticatedRequest, id: string): Promise<{
        id: string;
        name: string;
        url: string;
        userId: string;
    }>;
}
export {};
