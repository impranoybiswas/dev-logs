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
