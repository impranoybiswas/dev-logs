import { JobApplicationsService } from './job-applications.service';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';
import { UpdateJobApplicationDto } from './dto/update-job-application.dto';
interface AuthenticatedRequest extends Request {
    user: {
        userId: string;
        email: string;
    };
}
export declare class JobApplicationsController {
    private readonly jobApplicationsService;
    constructor(jobApplicationsService: JobApplicationsService);
    create(req: AuthenticatedRequest, createJobApplicationDto: CreateJobApplicationDto): Promise<{
        id: string;
        userId: string;
        company: string;
        role: string;
        status: string;
        appliedAt: Date;
        notes: string | null;
    }>;
    findAll(req: AuthenticatedRequest, search?: string, status?: string): Promise<{
        id: string;
        userId: string;
        company: string;
        role: string;
        status: string;
        appliedAt: Date;
        notes: string | null;
    }[]>;
    findOne(req: AuthenticatedRequest, id: string): Promise<{
        id: string;
        userId: string;
        company: string;
        role: string;
        status: string;
        appliedAt: Date;
        notes: string | null;
    }>;
    update(req: AuthenticatedRequest, id: string, updateJobApplicationDto: UpdateJobApplicationDto): Promise<{
        id: string;
        userId: string;
        company: string;
        role: string;
        status: string;
        appliedAt: Date;
        notes: string | null;
    }>;
    remove(req: AuthenticatedRequest, id: string): Promise<{
        id: string;
        userId: string;
        company: string;
        role: string;
        status: string;
        appliedAt: Date;
        notes: string | null;
    }>;
}
export {};
