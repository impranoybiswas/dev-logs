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

interface RequestWithOptionalUser extends Request {
  user?: {
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
    return await this.usersService.findById(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(
    @Request() req: AuthenticatedRequest,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<import('./users.service').SafeUser> {
    return await this.usersService.updateProfile(
      req.user.userId,
      updateProfileDto,
    );
  }

  @Get()
  async findAll(
    @Request() req: RequestWithOptionalUser,
  ): Promise<import('./users.service').SafeUser[]> {
    const userId = req.user?.userId ?? null;
    return await this.usersService.findAll(userId);
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
  @UseGuards(JwtAuthGuard)
  @Patch('friend-request/:id/respond')
  async respondToFriendRequest(
    @Request() req: AuthenticatedRequest,
    @Param('id') friendshipId: string,
    @Body('action') action: 'ACCEPT' | 'REJECT',
  ) {
    return await this.usersService.respondToFriendRequest(
      req.user.userId,
      friendshipId,
      action,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('friendships/sent')
  async getSentRequests(@Request() req: AuthenticatedRequest) {
    return await this.usersService.getFriendships(req.user.userId, 'SENT');
  }

  @UseGuards(JwtAuthGuard)
  @Get('friendships/received')
  async getReceivedRequests(@Request() req: AuthenticatedRequest) {
    return await this.usersService.getFriendships(req.user.userId, 'RECEIVED');
  }

  @UseGuards(JwtAuthGuard)
  @Get('friendships/accepted')
  async getFriends(@Request() req: AuthenticatedRequest) {
    return await this.usersService.getFriendships(req.user.userId, 'ACCEPTED');
  }

  @UseGuards(JwtAuthGuard)
  @Patch('friend-request/:id/unfriend')
  async unfriend(
    @Request() req: AuthenticatedRequest,
    @Param('id') friendshipId: string,
  ) {
    return await this.usersService.unfriend(req.user.userId, friendshipId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/profile')
  async getPublicProfile(
    @Param('id') userId: string,
  ): Promise<import('./users.service').UserWithRelations> {
    return await this.usersService.getPublicProfile(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('dashboard/stats')
  async getDashboardStats(@Request() req: AuthenticatedRequest) {
    return await this.usersService.getDashboardStats(req.user.userId);
  }
}
