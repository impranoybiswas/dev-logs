import { PrismaService } from '../prisma/prisma.service';
export interface Education {
    id: string;
    resumeId: string;
    school: string;
    degree: string | null;
    year: string | null;
}
export interface Experience {
    id: string;
    resumeId: string;
    company: string;
    position: string;
    duration: string | null;
    description: string | null;
}
export interface Skill {
    id: string;
    resumeId: string;
    name: string;
}
export interface Resume {
    id: string;
    userId: string;
    summary: string | null;
    createdAt: Date;
    updatedAt: Date;
    education: Education[];
    experience: Experience[];
    skills: Skill[];
}
export declare class ResumeService {
    private prisma;
    constructor(prisma: PrismaService);
    getResume(userId: string): Promise<Resume | null>;
    upsertResume(userId: string, data: any): Promise<Resume | null>;
}
