import { Injectable } from '@nestjs/common';
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

@Injectable()
export class ResumeService {
  constructor(private prisma: PrismaService) {}

  async getResume(userId: string): Promise<Resume | null> {
    return (await this.prisma.resume.findUnique({
      where: { userId },
      include: {
        user: true,
        education: true,
        experience: true,
        projects: true,
        skills: true,
      },
    })) as unknown as Resume | null;
  }

  async upsertResume(
    userId: string,
    data: UpsertResumeDto,
  ): Promise<Resume | null> {
    console.log('Upserting resume for user:', userId);
    console.log('Received data:', JSON.stringify(data, null, 2));
    const { personal, education, experience, skills, projects, templateId } =
      data;

    // First ensure the resume exists or create it
    const resume = await this.prisma.resume.upsert({
      where: { userId },
      create: {
        userId,
        name: personal?.name || null,
        email: personal?.email || null,
        phone: personal?.phone || null,
        templateId: templateId || 'modern',
        summary: personal?.summary || null,
      },
      update: {
        name: personal?.name || null,
        email: personal?.email || null,
        phone: personal?.phone || null,
        templateId: templateId || 'modern',
        summary: personal?.summary || null,
      },
    });
    console.log('Resume created/updated:', resume.id);

    // Handle Education
    if (education) {
      await this.prisma.education.deleteMany({
        where: { resumeId: resume.id },
      });
      const validEdu = education.filter((edu) => edu && edu.school);
      if (validEdu.length > 0) {
        await this.prisma.education.createMany({
          data: validEdu.map((edu) => ({
            resumeId: resume.id,
            school: edu.school,
            degree: edu?.degree || null,
            year: edu?.year || null,
          })),
        });
      }
    }

    // Handle Experience
    if (experience) {
      await this.prisma.experience.deleteMany({
        where: { resumeId: resume.id },
      });
      const validExp = experience.filter((exp) => exp && exp.company);
      if (validExp.length > 0) {
        await this.prisma.experience.createMany({
          data: validExp.map((exp) => ({
            resumeId: resume.id,
            company: exp.company,
            position: exp?.position || '',
            duration: exp?.duration || null,
            description: exp?.description || null,
          })),
        });
      }
    }

    // Handle Skills
    if (skills) {
      await this.prisma.skill.deleteMany({ where: { resumeId: resume.id } });
      const validSkills = skills.filter((skill) => skill && skill.name);
      if (validSkills.length > 0) {
        await this.prisma.skill.createMany({
          data: validSkills.map((skill) => ({
            resumeId: resume.id,
            name: skill.name,
          })),
        });
      }
    }

    // Handle Projects
    if (projects) {
      await this.prisma.project.deleteMany({ where: { resumeId: resume.id } });
      const validProjects = projects.filter((p) => p && p.title);
      if (validProjects.length > 0) {
        await this.prisma.project.createMany({
          data: validProjects.map((p) => ({
            resumeId: resume.id,
            title: p.title,
            details: Array.isArray(p.details)
              ? p.details.filter((d: string): d is string => !!d)
              : [],
            techStack: p.techStack || null,
          })),
        });
      }
    }

    return this.getResume(userId);
  }
}
