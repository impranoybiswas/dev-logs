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
exports.JobApplicationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let JobApplicationsService = class JobApplicationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, createJobApplicationDto) {
        const { appliedAt, ...data } = createJobApplicationDto;
        return this.prisma.jobApplication.create({
            data: {
                ...data,
                appliedAt: new Date(appliedAt),
                userId,
            },
        });
    }
    async findAll(userId, search, status) {
        return this.prisma.jobApplication.findMany({
            where: {
                userId,
                status: status || undefined,
                OR: search
                    ? [
                        { company: { contains: search, mode: 'insensitive' } },
                        { role: { contains: search, mode: 'insensitive' } },
                    ]
                    : undefined,
            },
            orderBy: { appliedAt: 'desc' },
        });
    }
    async findOne(userId, id) {
        const jobApplication = await this.prisma.jobApplication.findUnique({
            where: { id },
        });
        if (!jobApplication) {
            throw new common_1.NotFoundException('Job application not found');
        }
        if (jobApplication.userId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to access this job application');
        }
        return jobApplication;
    }
    async update(userId, id, updateJobApplicationDto) {
        await this.findOne(userId, id);
        const { appliedAt, ...data } = updateJobApplicationDto;
        return this.prisma.jobApplication.update({
            where: { id },
            data: {
                ...data,
                appliedAt: appliedAt ? new Date(appliedAt) : undefined,
            },
        });
    }
    async remove(userId, id) {
        await this.findOne(userId, id);
        return this.prisma.jobApplication.delete({
            where: { id },
        });
    }
};
exports.JobApplicationsService = JobApplicationsService;
exports.JobApplicationsService = JobApplicationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], JobApplicationsService);
//# sourceMappingURL=job-applications.service.js.map