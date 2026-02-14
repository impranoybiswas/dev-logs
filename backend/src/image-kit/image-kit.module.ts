import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ImageKitService } from './image-kit.service';
import { ImageKitController } from './image-kit.controller';

@Module({
  imports: [ConfigModule],
  controllers: [ImageKitController],
  providers: [ImageKitService],
  exports: [ImageKitService],
})
export class ImageKitModule {}
