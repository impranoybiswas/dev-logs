import {
  Controller,
  Get,
  Param,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { ChatService, ChatMessageResponse } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from '../users/users.service';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    private chatService: ChatService,
    private usersService: UsersService,
  ) {}

  @Get('messages/:friendId')
  async getMessages(
    @Request() req: any,
    @Param('friendId') friendId: string,
  ): Promise<ChatMessageResponse[]> {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
    const userId = req.user.id;
    /* eslint-enable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */

    // Check if they are friends
    const areFriends = await this.usersService.isFriend(
      userId as string,
      friendId,
    );
    if (!areFriends) {
      throw new ForbiddenException('You can only view messages with friends');
    }

    return await this.chatService.getMessages(userId as string, friendId);
  }
}
