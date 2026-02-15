import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { UsersService } from '../users/users.service';
import { PusherService } from './pusher.service';
import { UnauthorizedException } from '@nestjs/common';

interface SocketData {
  userId?: string;
}

type CustomSocket = Socket<any, any, any, SocketData>;

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  transports: ['websocket'],
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private jwtService: JwtService,
    private chatService: ChatService,
    private usersService: UsersService,
    private pusherService: PusherService,
  ) {}

  async handleConnection(client: CustomSocket) {
    try {
      const token =
        (client.handshake.auth?.token as string | undefined) ||
        client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        throw new UnauthorizedException('Missing token');
      }

      const payload = await this.jwtService.verifyAsync<{ sub: string }>(token);
      const userId = payload.sub;

      client.data.userId = userId;
      console.log(`User connected: ${userId} (${client.id})`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.log('Connection rejected:', errorMessage);
      client.disconnect();
    }
  }

  handleDisconnect(client: CustomSocket) {
    const userId = client.data.userId;
    if (userId) {
      console.log(`User disconnected: ${userId}`);
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: CustomSocket,
    @MessageBody() data: { receiverId: string; content: string },
  ) {
    const senderId = client.data.userId;
    if (!senderId) {
      client.emit('error', 'Unauthorized');
      return;
    }
    const { receiverId, content } = data;

    // 1. Check if they are friends
    const areFriends = await this.usersService.isFriend(senderId, receiverId);
    if (!areFriends) {
      client.emit('error', 'You can only chat with friends');
      return;
    }

    // 2. Save to database
    const message = await this.chatService.saveMessage(
      senderId,
      receiverId,
      content,
    );

    // 3. Trigger Pusher event for receiver
    await this.pusherService.trigger(
      `user-${receiverId}`,
      'newMessage',
      message,
    );

    // 4. Trigger Pusher event for sender (to sync multiple devices/tabs)
    await this.pusherService.trigger(
      `user-${senderId}`,
      'messageSent',
      message,
    );
  }
}
