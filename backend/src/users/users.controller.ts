import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
  };
}

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(
    @Request() req: AuthenticatedRequest,
  ): Promise<import('./users.service').UserWithRelations> {
    return this.usersService.findById(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(
    @Request() req: AuthenticatedRequest,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<import('./users.service').SafeUser> {
    return this.usersService.updateProfile(req.user.userId, updateProfileDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(
    @Request() req: AuthenticatedRequest,
  ): Promise<import('./users.service').SafeUser[]> {
    return await this.usersService.findAll(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('friend-request/:id')
  async sendFriendRequest(
    @Request() req: AuthenticatedRequest,
    @Param('id') receiverId: string,
  ) {
    return await this.usersService.sendFriendRequest(
      req.user.userId,
      receiverId,
    );
  }
}
