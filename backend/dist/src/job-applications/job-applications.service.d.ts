import { PrismaService } from '../prisma/prisma.service';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';
import { UpdateJobApplicationDto } from './dto/update-job-application.dto';
export declare class JobApplicationsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, createJobApplicationDto: CreateJobApplicationDto): Promise<{
        id: string;
        userId: string;
        company: string;
        role: string;
        status: string;
        appliedAt: Date;
        notes: string | null;
    }>;
    findAll(userId: string, search?: string, status?: string): Promise<{
        id: string;
        userId: string;
        company: string;
        role: string;
        status: string;
        appliedAt: Date;
        notes: string | null;
    }[]>;
    findOne(userId: string, id: string): Promise<{
        id: string;
        userId: string;
        company: string;
        role: string;
        status: string;
        appliedAt: Date;
        notes: string | null;
    }>;
    update(userId: string, id: string, updateJobApplicationDto: UpdateJobApplicationDto): Promise<{
        id: string;
        userId: string;
        company: string;
        role: string;
        status: string;
        appliedAt: Date;
        notes: string | null;
    }>;
    remove(userId: string, id: string): Promise<{
        id: string;
        userId: string;
        company: string;
        role: string;
        status: string;
        appliedAt: Date;
        notes: string | null;
    }>;
}
