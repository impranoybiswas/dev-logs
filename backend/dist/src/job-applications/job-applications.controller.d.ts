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
        company: string;
        role: string;
        status: string;
        appliedAt: Date;
        notes: string | null;
        userId: string;
    }>;
    findAll(req: AuthenticatedRequest, search?: string, status?: string): Promise<{
        id: string;
        company: string;
        role: string;
        status: string;
        appliedAt: Date;
        notes: string | null;
        userId: string;
    }[]>;
    findOne(req: AuthenticatedRequest, id: string): Promise<{
        id: string;
        company: string;
        role: string;
        status: string;
        appliedAt: Date;
        notes: string | null;
        userId: string;
    }>;
    update(req: AuthenticatedRequest, id: string, updateJobApplicationDto: UpdateJobApplicationDto): Promise<{
        id: string;
        company: string;
        role: string;
        status: string;
        appliedAt: Date;
        notes: string | null;
        userId: string;
    }>;
    remove(req: AuthenticatedRequest, id: string): Promise<{
        id: string;
        company: string;
        role: string;
        status: string;
        appliedAt: Date;
        notes: string | null;
        userId: string;
    }>;
}
export {};
