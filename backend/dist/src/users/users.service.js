"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: data.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Email already exists');
        }
        const hashedPassword = await bcrypt.hash(data.password, 10);
        return this.prisma.user.create({
            data: {
                ...data,
                password: hashedPassword,
            },
            select: {
                id: true,
                name: true,
                email: true,
                profilePhoto: true,
                gender: true,
                birthDate: true,
                createdAt: true,
            },
        });
    }
    async findByEmail(email) {
        return await this.prisma.user.findUnique({
            where: { email },
        });
    }
    async findById(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                gender: true,
                birthDate: true,
                profilePhoto: true,
                socialLinks: true,
                jobApplications: true,
                createdAt: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async updateProfile(id, data) {
        const updateData = { ...data };
        if (updateData.birthDate) {
            updateData.birthDate = new Date(updateData.birthDate);
        }
        return await this.prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                profilePhoto: true,
                gender: true,
                birthDate: true,
                createdAt: true,
            },
        });
    }
    async findAll(excludeUserId) {
        const users = await this.prisma.user.findMany({
            where: {
                id: { not: excludeUserId },
            },
            select: {
                id: true,
                name: true,
                email: true,
                profilePhoto: true,
                gender: true,
                birthDate: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        const friendships = await this.prisma.friendship.findMany({
            where: {
                OR: [{ requesterId: excludeUserId }, { receiverId: excludeUserId }],
            },
        });
        return users.map((user) => {
            const friendship = friendships.find((f) => f.requesterId === user.id || f.receiverId === user.id);
            let status = 'NONE';
            if (friendship) {
                status = friendship.status;
            }
            return {
                ...user,
                friendshipStatus: status,
                isRequester: friendship
                    ? friendship.requesterId === excludeUserId
                    : false,
            };
        });
    }
    async sendFriendRequest(requesterId, receiverId) {
        if (requesterId === receiverId) {
            throw new common_1.ConflictException('You cannot send a friend request to yourself');
        }
        const receiver = await this.prisma.user.findUnique({
            where: { id: receiverId },
        });
        if (!receiver) {
            throw new common_1.NotFoundException('User not found');
        }
        const existingFriendship = await this.prisma.friendship.findFirst({
            where: {
                OR: [
                    { requesterId, receiverId },
                    { requesterId: receiverId, receiverId: requesterId },
                ],
            },
        });
        if (existingFriendship) {
            throw new common_1.ConflictException('Friend request already exists or you are already friends');
        }
        const friendship = await this.prisma.friendship.create({
            data: {
                requesterId,
                receiverId,
                status: 'PENDING',
            },
        });
        const requester = await this.prisma.user.findUnique({
            where: { id: requesterId },
            select: { name: true },
        });
        await this.prisma.notification.create({
            data: {
                type: 'FRIEND_REQUEST',
                message: `${requester?.name || 'Someone'} sent you a friend request`,
                userId: receiverId,
                requesterId,
            },
        });
        return friendship;
    }
    async respondToFriendRequest(userId, friendshipId, action) {
        const friendship = await this.prisma.friendship.findUnique({
            where: { id: friendshipId },
            include: { receiver: true, requester: true },
        });
        if (!friendship ||
            friendship.receiverId !== userId ||
            friendship.status !== 'PENDING') {
            throw new common_1.NotFoundException('Friend request not found');
        }
        if (action === 'REJECT') {
            await this.prisma.friendship.update({
                where: { id: friendship.id },
                data: { status: 'REJECTED' },
            });
            await this.prisma.notification.updateMany({
                where: {
                    userId,
                    requesterId: friendship.requesterId,
                    type: 'FRIEND_REQUEST',
                    read: false,
                },
                data: { read: true },
            });
            return { message: 'Friend request rejected' };
        }
        const updatedFriendship = await this.prisma.friendship.update({
            where: { id: friendship.id },
            data: { status: 'ACCEPTED' },
        });
        await this.prisma.notification.updateMany({
            where: {
                userId,
                requesterId: friendship.requesterId,
                type: 'FRIEND_REQUEST',
                read: false,
            },
            data: { read: true },
        });
        await this.prisma.notification.create({
            data: {
                type: 'FRIEND_ACCEPTED',
                message: `${friendship.receiver.name} accepted your friend request`,
                userId: friendship.requesterId,
                requesterId: userId,
            },
        });
        return updatedFriendship;
    }
    async getFriendships(userId, type) {
        const friendships = await this.prisma.friendship.findMany({
            where: type === 'SENT'
                ? { requesterId: userId, status: 'PENDING' }
                : type === 'RECEIVED'
                    ? { receiverId: userId, status: 'PENDING' }
                    : {
                        status: 'ACCEPTED',
                        OR: [{ requesterId: userId }, { receiverId: userId }],
                    },
            include: {
                requester: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        profilePhoto: true,
                        gender: true,
                        birthDate: true,
                        createdAt: true,
                    },
                },
                receiver: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        profilePhoto: true,
                        gender: true,
                        birthDate: true,
                        createdAt: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return friendships.map((f) => {
            let friend;
            if (type === 'SENT') {
                friend = f.receiver;
            }
            else if (type === 'RECEIVED') {
                friend = f.requester;
            }
            else {
                friend = f.requesterId === userId ? f.receiver : f.requester;
            }
            return {
                id: f.id,
                status: f.status,
                createdAt: f.createdAt,
                user: friend,
            };
        });
    }
    async cancelFriendRequest(userId, friendshipId) {
        const friendship = await this.prisma.friendship.findUnique({
            where: { id: friendshipId },
        });
        if (!friendship) {
            throw new common_1.NotFoundException('Friend request not found');
        }
        if (friendship.requesterId !== userId) {
            throw new common_1.ConflictException('You can only cancel requests you sent');
        }
        if (friendship.status !== 'PENDING') {
            throw new common_1.ConflictException('Can only cancel pending requests');
        }
        await this.prisma.friendship.delete({
            where: { id: friendshipId },
        });
        await this.prisma.notification.deleteMany({
            where: {
                userId: friendship.receiverId,
                requesterId: userId,
                type: 'FRIEND_REQUEST',
            },
        });
        return { message: 'Friend request cancelled' };
    }
    async unfriend(userId, friendshipId) {
        const friendship = await this.prisma.friendship.findUnique({
            where: { id: friendshipId },
        });
        if (!friendship) {
            throw new common_1.NotFoundException('Friendship not found');
        }
        if (friendship.requesterId !== userId && friendship.receiverId !== userId) {
            throw new common_1.ConflictException('You can only remove your own friendships');
        }
        if (friendship.status !== 'ACCEPTED') {
            throw new common_1.ConflictException('Can only unfriend accepted connections');
        }
        await this.prisma.friendship.delete({
            where: { id: friendshipId },
        });
        return { message: 'Friend removed' };
    }
    async getPublicProfile(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                gender: true,
                birthDate: true,
                profilePhoto: true,
                socialLinks: true,
                createdAt: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return {
            ...user,
            jobApplications: [],
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map