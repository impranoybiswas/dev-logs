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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatController = void 0;
const common_1 = require("@nestjs/common");
const chat_service_1 = require("./chat.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const users_service_1 = require("../users/users.service");
const pusher_service_1 = require("./pusher.service");
const requestWithUserInterface = __importStar(require("../auth/interfaces/request-with-user.interface"));
let ChatController = class ChatController {
    chatService;
    usersService;
    pusherService;
    constructor(chatService, usersService, pusherService) {
        this.chatService = chatService;
        this.usersService = usersService;
        this.pusherService = pusherService;
    }
    async testPusher() {
        try {
            await this.pusherService.trigger('test-channel', 'test-event', {
                message: 'test',
            });
            return { success: true, message: 'Pusher is working' };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }
    async emitTyping(req, friendId) {
        const userId = req.user.id;
        const user = await this.usersService.findById(userId);
        await this.pusherService.trigger(`user-${friendId}`, 'userTyping', {
            userId: userId,
            userName: user.name,
        });
        return { success: true };
    }
    async getMessages(req, friendId) {
        const userId = req.user.id;
        const areFriends = await this.usersService.isFriend(userId, friendId);
        if (!areFriends) {
            throw new common_1.ForbiddenException('You can only view messages with friends');
        }
        return await this.chatService.getMessages(userId, friendId);
    }
    async sendMessage(req, body) {
        try {
            const senderId = req.user.id;
            const { receiverId, content } = body;
            const areFriends = await this.usersService.isFriend(senderId, receiverId);
            if (!areFriends) {
                throw new common_1.ForbiddenException('You can only chat with friends');
            }
            const message = await this.chatService.saveMessage(senderId, receiverId, content);
            await this.pusherService.trigger(`user-${receiverId}`, 'newMessage', message);
            await this.pusherService.trigger(`user-${senderId}`, 'messageSent', message);
            return message;
        }
        catch (error) {
            console.error('Error in sendMessage:', error);
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new common_1.InternalServerErrorException(message);
        }
    }
};
exports.ChatController = ChatController;
__decorate([
    (0, common_1.Get)('test-pusher'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "testPusher", null);
__decorate([
    (0, common_1.Post)('typing/:friendId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('friendId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "emitTyping", null);
__decorate([
    (0, common_1.Get)('messages/:friendId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('friendId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getMessages", null);
__decorate([
    (0, common_1.Post)('send'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "sendMessage", null);
exports.ChatController = ChatController = __decorate([
    (0, common_1.Controller)('chat'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [chat_service_1.ChatService,
        users_service_1.UsersService,
        pusher_service_1.PusherService])
], ChatController);
//# sourceMappingURL=chat.controller.js.map