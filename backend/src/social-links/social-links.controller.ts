import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  Patch,
} from '@nestjs/common';
import { SocialLinksService } from './social-links.service';
import { CreateSocialLinkDto } from './dto/create-social-link.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
  };
}

@Controller('social-links')
@UseGuards(JwtAuthGuard)
export class SocialLinksController {
  constructor(private readonly socialLinksService: SocialLinksService) {}

  @Post()
  create(
    @Request() req: AuthenticatedRequest,
    @Body() createSocialLinkDto: CreateSocialLinkDto,
  ) {
    return this.socialLinksService.create(req.user.userId, createSocialLinkDto);
  }

  @Get()
  findAll(@Request() req: AuthenticatedRequest) {
    return this.socialLinksService.findAll(req.user.userId);
  }

  @Patch(':id')
  update(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() updateSocialLinkDto: Partial<CreateSocialLinkDto>,
  ) {
    return this.socialLinksService.update(
      req.user.userId,
      id,
      updateSocialLinkDto,
    );
  }

  @Delete(':id')
  remove(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.socialLinksService.remove(req.user.userId, id);
  }
}
