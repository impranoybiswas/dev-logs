import { PrismaService } from '../prisma/prisma.service';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';
import { UpdateJobApplicationDto } from './dto/update-job-application.dto';
export declare class JobApplicationsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, createJobApplicationDto: CreateJobApplicationDto): Promise<{
        id: string;
        company: string;
        role: string;
        status: string;
        appliedAt: Date;
        notes: string | null;
        userId: string;
    }>;
    findAll(userId: string, search?: string, status?: string): Promise<{
        id: string;
        company: string;
        role: string;
        status: string;
        appliedAt: Date;
        notes: string | null;
        userId: string;
    }[]>;
    findOne(userId: string, id: string): Promise<{
        id: string;
        company: string;
        role: string;
        status: string;
        appliedAt: Date;
        notes: string | null;
        userId: string;
    }>;
    update(userId: string, id: string, updateJobApplicationDto: UpdateJobApplicationDto): Promise<{
        id: string;
        company: string;
        role: string;
        status: string;
        appliedAt: Date;
        notes: string | null;
        userId: string;
    }>;
    remove(userId: string, id: string): Promise<{
        id: string;
        company: string;
        role: string;
        status: string;
        appliedAt: Date;
        notes: string | null;
        userId: string;
    }>;
}
