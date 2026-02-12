import { SocialLinksService } from './social-links.service';
import { CreateSocialLinkDto } from './dto/create-social-link.dto';
interface AuthenticatedRequest extends Request {
    user: {
        userId: string;
        email: string;
    };
}
export declare class SocialLinksController {
    private readonly socialLinksService;
    constructor(socialLinksService: SocialLinksService);
    create(req: AuthenticatedRequest, createSocialLinkDto: CreateSocialLinkDto): Promise<{
        name: string;
        id: string;
        url: string;
        userId: string;
    }>;
    findAll(req: AuthenticatedRequest): Promise<{
        name: string;
        id: string;
        url: string;
        userId: string;
    }[]>;
    remove(req: AuthenticatedRequest, id: string): Promise<{
        name: string;
        id: string;
        url: string;
        userId: string;
    }>;
}
export {};
