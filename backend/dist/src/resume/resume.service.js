"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResumeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ResumeService = class ResumeService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getResume(userId) {
        return this.prisma.resume.findUnique({
            where: { userId },
            include: {
                education: true,
                experience: true,
                skills: true,
            },
        });
    }
    async upsertResume(userId, data) {
        const { personal, education, experience, skills } = data;
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
        return this.getResume(userId);
    }
};
exports.ResumeService = ResumeService;
exports.ResumeService = ResumeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ResumeService);
//# sourceMappingURL=resume.service.js.map