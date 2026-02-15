import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';

import { ChatController } from './chat.controller';
import { PusherService } from './pusher.service';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway, PusherService],
  exports: [ChatService, PusherService],
})
export class ChatModule {}
