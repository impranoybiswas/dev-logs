import { UsersService } from './users.service';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    getProfile(req: {
        user: {
            userId: string;
            email: string;
        };
    }): Promise<{
        id: string;
        email: string;
        name: string;
        profilePhoto: string | null;
        gender: string | null;
        birthDate: Date | null;
        createdAt: Date;
        socialLinks: {
            id: string;
            name: string;
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
