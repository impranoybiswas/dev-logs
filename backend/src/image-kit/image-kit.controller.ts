import { Controller, Get } from '@nestjs/common';
import { ImageKitService } from './image-kit.service';

@Controller('image-kit')
export class ImageKitController {
  constructor(private readonly imageKitService: ImageKitService) {}

  @Get('auth')
  getAuthParameters() {
    return this.imageKitService.getAuthenticationParameters();
  }
}
