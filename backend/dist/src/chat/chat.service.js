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
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const redis_service_1 = require("../redis/redis.service");
let ChatService = class ChatService {
    prisma;
    redisService;
    constructor(prisma, redisService) {
        this.prisma = prisma;
        this.redisService = redisService;
    }
    getChatKey(userId1, userId2) {
        const [minId, maxId] = [userId1, userId2].sort();
        return `chat:${minId}:${maxId}`;
    }
    async saveMessage(senderId, receiverId, content) {
        const message = await this.prisma.chatMessage.create({
            data: {
                content,
                senderId,
                receiverId,
            },
        });
        const key = this.getChatKey(senderId, receiverId);
        await this.redisService.del(key);
        return message;
    }
    async getMessages(userId1, userId2) {
        const key = this.getChatKey(userId1, userId2);
        const cachedMessages = (await this.redisService.get(key));
        if (cachedMessages) {
            return cachedMessages;
        }
        const messages = await this.prisma.chatMessage.findMany({
            where: {
                OR: [
                    { senderId: userId1, receiverId: userId2 },
                    { senderId: userId2, receiverId: userId1 },
                ],
            },
            orderBy: {
                createdAt: 'asc',
            },
        });
        await this.redisService.set(key, messages, 3600);
        return messages;
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], ChatService);
//# sourceMappingURL=chat.service.js.map