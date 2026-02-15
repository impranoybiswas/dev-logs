import { ChatService, ChatMessageResponse } from './chat.service';
import { UsersService } from '../users/users.service';
import { PusherService } from './pusher.service';
import * as requestWithUserInterface from '../auth/interfaces/request-with-user.interface';
export declare class ChatController {
    private chatService;
    private usersService;
    private pusherService;
    constructor(chatService: ChatService, usersService: UsersService, pusherService: PusherService);
    testPusher(): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        message?: undefined;
    }>;
    emitTyping(req: requestWithUserInterface.RequestWithUser, friendId: string): Promise<{
        success: boolean;
    }>;
    getMessages(req: requestWithUserInterface.RequestWithUser, friendId: string): Promise<ChatMessageResponse[]>;
    sendMessage(req: requestWithUserInterface.RequestWithUser, body: {
        receiverId: string;
        content: string;
    }): Promise<ChatMessageResponse>;
}
