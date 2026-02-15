import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { UsersService } from '../users/users.service';
import { PusherService } from './pusher.service';
interface SocketData {
    userId?: string;
}
type CustomSocket = Socket<any, any, any, SocketData>;
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private jwtService;
    private chatService;
    private usersService;
    private pusherService;
    server: Server;
    constructor(jwtService: JwtService, chatService: ChatService, usersService: UsersService, pusherService: PusherService);
    handleConnection(client: CustomSocket): Promise<void>;
    handleDisconnect(client: CustomSocket): void;
    handleSendMessage(client: CustomSocket, data: {
        receiverId: string;
        content: string;
    }): Promise<void>;
}
export {};
