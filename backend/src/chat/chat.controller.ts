import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ChatService, ChatMessageResponse } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from '../users/users.service';
import { PusherService } from './pusher.service';
import * as requestWithUserInterface from '../auth/interfaces/request-with-user.interface';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    private chatService: ChatService,
    private usersService: UsersService,
    private pusherService: PusherService,
  ) {}

  @Get('test-pusher')
  async testPusher() {
    try {
      await this.pusherService.trigger('test-channel', 'test-event', {
        message: 'test',
      });
      return { success: true, message: 'Pusher is working' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  @Post('typing/:friendId')
  async emitTyping(
    @Request() req: requestWithUserInterface.RequestWithUser,
    @Param('friendId') friendId: string,
  ) {
    const userId = req.user.id;
    const user = await this.usersService.findById(userId);

    // Trigger typing event to friend's channel
    await this.pusherService.trigger(`user-${friendId}`, 'userTyping', {
      userId: userId,
      userName: user.name,
    });

    return { success: true };
  }

  @Get('messages/:friendId')
  async getMessages(
    @Request() req: requestWithUserInterface.RequestWithUser,
    @Param('friendId') friendId: string,
  ): Promise<ChatMessageResponse[]> {
    const userId = req.user.id;

    // Check if they are friends
    const areFriends = await this.usersService.isFriend(userId, friendId);
    if (!areFriends) {
      throw new ForbiddenException('You can only view messages with friends');
    }

    return await this.chatService.getMessages(userId, friendId);
  }

  @Post('send')
  async sendMessage(
    @Request() req: requestWithUserInterface.RequestWithUser,
    @Body() body: { receiverId: string; content: string },
  ) {
    try {
      const senderId = req.user.id;
      const { receiverId, content } = body;

      // 1. Check if they are friends
      const areFriends = await this.usersService.isFriend(senderId, receiverId);
      if (!areFriends) {
        throw new ForbiddenException('You can only chat with friends');
      }

      // 2. Save to database
      const message = await this.chatService.saveMessage(
        senderId,
        receiverId,
        content,
      );

      // 3. Trigger Pusher events
      await this.pusherService.trigger(
        `user-${receiverId}`,
        'newMessage',
        message,
      );
      await this.pusherService.trigger(
        `user-${senderId}`,
        'messageSent',
        message,
      );

      return message;
    } catch (error) {
      console.error('Error in sendMessage:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(message);
    }
  }
}
