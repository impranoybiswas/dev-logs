import { PrismaService } from '../prisma/prisma.service';
export interface ResumeEducation {
    id: string;
    resumeId: string;
    school: string;
    degree: string | null;
    year: string | null;
}
export interface ResumeExperience {
    id: string;
    resumeId: string;
    company: string;
    position: string;
    duration: string | null;
    description: string | null;
}
export interface ResumeSkill {
    id: string;
    resumeId: string;
    name: string;
}
export interface ResumeProject {
    id: string;
    resumeId: string;
    title: string;
    details: string[];
    techStack: string | null;
}
export interface UpsertEducation {
    school: string;
    degree?: string | null;
    year?: string | null;
}
export interface UpsertExperience {
    company: string;
    position?: string;
    duration?: string | null;
    description?: string | null;
}
export interface UpsertSkill {
    name: string;
}
export interface UpsertProject {
    title: string;
    details?: string[];
    techStack?: string | null;
}
export interface UpsertResumeDto {
    personal?: {
        name?: string | null;
        email?: string | null;
        phone?: string | null;
        summary?: string | null;
    };
    templateId?: string | null;
    education?: UpsertEducation[];
    experience?: UpsertExperience[];
    skills?: UpsertSkill[];
    projects?: UpsertProject[];
}
export interface Resume {
    id: string;
    userId: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    templateId: string | null;
    summary: string | null;
    createdAt: Date;
    updatedAt: Date;
    projects: ResumeProject[];
    education: ResumeEducation[];
    experience: ResumeExperience[];
    skills: ResumeSkill[];
}
export declare class ResumeService {
    private prisma;
    constructor(prisma: PrismaService);
    getResume(userId: string): Promise<Resume | null>;
    upsertResume(userId: string, data: UpsertResumeDto): Promise<Resume | null>;
}
