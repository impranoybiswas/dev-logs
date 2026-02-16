import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SocialLinksModule } from './social-links/social-links.module';
import { JobApplicationsModule } from './job-applications/job-applications.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ChatModule } from './chat/chat.module';
import { ImageKitModule } from './image-kit/image-kit.module';
import { ResumeModule } from './resume/resume.module';

import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    RedisModule,
    AuthModule,
    UsersModule,
    PrismaModule,
    SocialLinksModule,
    JobApplicationsModule,
    NotificationsModule,
    ChatModule,
    ImageKitModule,
    ResumeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
