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
export interface Project {
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
    summary: string | null;
    createdAt: Date;
    updatedAt: Date;
    projects: Project[];
    education: Education[];
    experience: Experience[];
    skills: Skill[];
}
export declare class ResumeService {
    private prisma;
    constructor(prisma: PrismaService);
    getResume(userId: string): Promise<Resume | null>;
    upsertResume(userId: string, data: UpsertResumeDto): Promise<Resume | null>;
}
