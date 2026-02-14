import { ChatService, ChatMessageResponse } from './chat.service';
import { UsersService } from '../users/users.service';
export declare class ChatController {
    private chatService;
    private usersService;
    constructor(chatService: ChatService, usersService: UsersService);
    getMessages(req: any, friendId: string): Promise<ChatMessageResponse[]>;
}
