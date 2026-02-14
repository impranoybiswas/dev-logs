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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const jwt_1 = require("@nestjs/jwt");
const chat_service_1 = require("./chat.service");
const users_service_1 = require("../users/users.service");
const common_1 = require("@nestjs/common");
let ChatGateway = class ChatGateway {
    jwtService;
    chatService;
    usersService;
    server;
    connectedUsers = new Map();
    constructor(jwtService, chatService, usersService) {
        this.jwtService = jwtService;
        this.chatService = chatService;
        this.usersService = usersService;
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth.token ||
                client.handshake.headers.authorization?.split(' ')[1];
            if (!token) {
                throw new common_1.UnauthorizedException('Missing token');
            }
            const payload = await this.jwtService.verifyAsync(token);
            const userId = payload.sub;
            this.connectedUsers.set(userId, client.id);
            client.data.userId = userId;
            console.log(`User connected: ${userId} (${client.id})`);
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            console.log('Connection rejected:', errorMessage);
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        const userId = client.data.userId;
        if (userId) {
            this.connectedUsers.delete(userId);
            console.log(`User disconnected: ${userId}`);
        }
    }
    async handleSendMessage(client, data) {
        const senderId = client.data.userId;
        const { receiverId, content } = data;
        const areFriends = await this.usersService.isFriend(senderId, receiverId);
        if (!areFriends) {
            client.emit('error', 'You can only chat with friends');
            return;
        }
        const message = await this.chatService.saveMessage(senderId, receiverId, content);
        const receiverSocketId = this.connectedUsers.get(receiverId);
        if (receiverSocketId) {
            this.server.to(receiverSocketId).emit('newMessage', message);
        }
        client.emit('messageSent', message);
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('sendMessage'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleSendMessage", null);
exports.ChatGateway = ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        chat_service_1.ChatService,
        users_service_1.UsersService])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map