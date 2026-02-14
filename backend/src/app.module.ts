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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
    AuthModule,
    SocialLinksModule,
    JobApplicationsModule,
    NotificationsModule,
    ChatModule,
    ImageKitModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
