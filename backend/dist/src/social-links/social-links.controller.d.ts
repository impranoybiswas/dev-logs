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
        url: string;
        name: string;
        id: string;
        userId: string;
    }>;
    findAll(req: AuthenticatedRequest): Promise<{
        url: string;
        name: string;
        id: string;
        userId: string;
    }[]>;
    update(req: AuthenticatedRequest, id: string, updateSocialLinkDto: Partial<CreateSocialLinkDto>): Promise<{
        url: string;
        name: string;
        id: string;
        userId: string;
    }>;
    remove(req: AuthenticatedRequest, id: string): Promise<{
        url: string;
        name: string;
        id: string;
        userId: string;
    }>;
}
export {};
