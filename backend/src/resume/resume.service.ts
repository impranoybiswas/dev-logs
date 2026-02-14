import { Injectable } from '@nestjs/common';
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

@Injectable()
export class ResumeService {
  constructor(private prisma: PrismaService) {}

  async getResume(userId: string): Promise<Resume | null> {
    return this.prisma.resume.findUnique({
      where: { userId },
      include: {
        education: true,
        experience: true,
        skills: true,
      },
    }) as unknown as Resume | null;
  }

  async upsertResume(userId: string, data: any): Promise<Resume | null> {
    const { personal, education, experience, skills } = data;

    // First ensure the resume exists or create it
    const resume = await this.prisma.resume.upsert({
      where: { userId },
      create: {
        userId,
        summary: personal.summary,
      },
      update: {
        summary: personal.summary,
      },
    });

    // Handle Education
    if (education) {
      await this.prisma.education.deleteMany({
        where: { resumeId: resume.id },
      });
      const validEdu = education.filter((edu: any) => edu && edu.school);
      if (validEdu.length > 0) {
        await this.prisma.education.createMany({
          data: validEdu.map((edu: any) => ({
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
      const validExp = experience.filter((exp: any) => exp && exp.company);
      if (validExp.length > 0) {
        await this.prisma.experience.createMany({
          data: validExp.map((exp: any) => ({
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
      const validSkills = skills.filter((skill: any) => skill && skill.name);
      if (validSkills.length > 0) {
        await this.prisma.skill.createMany({
          data: validSkills.map((skill: any) => ({
            resumeId: resume.id,
            name: skill.name,
          })),
        });
      }
    }

    return this.getResume(userId);
  }
}
