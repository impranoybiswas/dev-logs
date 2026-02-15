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
var SocialLinksService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialLinksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SocialLinksService = SocialLinksService_1 = class SocialLinksService {
    prisma;
    logger = new common_1.Logger(SocialLinksService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, createSocialLinkDto) {
        try {
            return await this.prisma.socialLink.create({
                data: {
                    ...createSocialLinkDto,
                    userId,
                },
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorStack = error instanceof Error ? error.stack : '';
            this.logger.error(`Failed to create social link for user ${userId}: ${errorMessage}`, errorStack);
            throw error;
        }
    }
    async findAll(userId) {
        return this.prisma.socialLink.findMany({
            where: { userId },
        });
    }
    async update(userId, id, updateData) {
        const socialLink = await this.prisma.socialLink.findUnique({
            where: { id },
        });
        if (!socialLink) {
            throw new common_1.NotFoundException('Social link not found');
        }
        if (socialLink.userId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to update this social link');
        }
        return this.prisma.socialLink.update({
            where: { id },
            data: updateData,
        });
    }
    async remove(userId, id) {
        const socialLink = await this.prisma.socialLink.findUnique({
            where: { id },
        });
        if (!socialLink) {
            throw new common_1.NotFoundException('Social link not found');
        }
        if (socialLink.userId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to delete this social link');
        }
        return this.prisma.socialLink.delete({
            where: { id },
        });
    }
};
exports.SocialLinksService = SocialLinksService;
exports.SocialLinksService = SocialLinksService = SocialLinksService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SocialLinksService);
//# sourceMappingURL=social-links.service.js.map