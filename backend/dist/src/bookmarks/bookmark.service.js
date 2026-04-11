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
exports.BookmarkService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let BookmarkService = class BookmarkService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, data) {
        return await this.prisma.bookmark.create({
            data: {
                ...data,
                userId,
            },
        });
    }
    async findAll(userId) {
        return await this.prisma.bookmark.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async remove(userId, id) {
        return await this.prisma.bookmark.delete({
            where: { id, userId },
        });
    }
    async update(userId, id, data) {
        return await this.prisma.bookmark.update({
            where: { id, userId },
            data,
        });
    }
    async bulkSync(userId, bookmarks) {
        const results = [];
        for (const b of bookmarks) {
            const exists = await this.prisma.bookmark.findFirst({
                where: { userId, url: b.url },
            });
            if (!exists) {
                const created = await this.prisma.bookmark.create({
                    data: {
                        title: b.title,
                        url: b.url,
                        category: b.category,
                        favicon: b.favicon,
                        userId,
                    },
                });
                results.push(created);
            }
        }
        return results;
    }
};
exports.BookmarkService = BookmarkService;
exports.BookmarkService = BookmarkService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BookmarkService);
//# sourceMappingURL=bookmark.service.js.map