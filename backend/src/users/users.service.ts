import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from '../auth/dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  profilePhoto: string | null;
  gender: string | null;
  birthDate: Date | null;
  createdAt: Date;
  friendshipStatus?: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'NONE';
}

export interface UserWithRelations extends SafeUser {
  socialLinks: any[];
  jobApplications: any[];
}

export interface FriendshipWithUser {
  id: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: Date;
  user: SafeUser;
}

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {}

  async create(data: RegisterDto): Promise<SafeUser> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    return this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        profilePhoto: true,
        gender: true,
        birthDate: true,
        createdAt: true,
      },
    });
  }

  async findByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string): Promise<UserWithRelations> {
    const cacheKey = `user:profile:${id}`;
    const cachedUser = await this.redisService.get(cacheKey);

    if (cachedUser) {
      return cachedUser;
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        gender: true,
        birthDate: true,
        profilePhoto: true,
        socialLinks: true,
        jobApplications: true,
        createdAt: true,
      },
    });

    if (user) {
      await this.redisService.set(cacheKey, user, 3600); // Cache for 1 hour
    }

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(id: string, data: UpdateProfileDto): Promise<SafeUser> {
    const updateData: any = { ...data };
    /* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
    if (updateData.birthDate) {
      updateData.birthDate = new Date(updateData.birthDate as string);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
      /* eslint-enable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
      select: {
        id: true,
        name: true,
        email: true,
        profilePhoto: true,
        gender: true,
        birthDate: true,
        createdAt: true,
      },
    });

    // Invalidate cache
    await this.redisService.del(`user:profile:${id}`);

    return updatedUser;
  }

  async findAll(excludeUserId?: string | null): Promise<SafeUser[]> {
    const whereClause = excludeUserId ? { id: { not: excludeUserId } } : {};
    const users = await this.prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        profilePhoto: true,
        gender: true,
        birthDate: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const friendships = excludeUserId
      ? await this.prisma.friendship.findMany({
          where: {
            OR: [{ requesterId: excludeUserId }, { receiverId: excludeUserId }],
          },
        })
      : [];

    return users.map((user) => {
      const friendship = friendships.find(
        (f) => f.requesterId === user.id || f.receiverId === user.id,
      );

      let status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'NONE' = 'NONE';
      if (friendship) {
        status = friendship.status;
        // If it's pending, we might want to know if WE sent it or THEY sent it
        // But for compatibility, we'll stick to 'PENDING' and handle details in specialized endpoints
      }

      return {
        ...user,
        friendshipStatus: status,
        isRequester: friendship
          ? friendship.requesterId === excludeUserId
          : false,
      };
    });
  }

  async sendFriendRequest(requesterId: string, receiverId: string) {
    if (requesterId === receiverId) {
      throw new ConflictException(
        'You cannot send a friend request to yourself',
      );
    }

    const receiver = await this.prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      throw new NotFoundException('User not found');
    }

    const existingFriendship = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId, receiverId },
          { requesterId: receiverId, receiverId: requesterId },
        ],
      },
    });

    if (existingFriendship) {
      throw new ConflictException(
        'Friend request already exists or you are already friends',
      );
    }

    const friendship = await this.prisma.friendship.create({
      data: {
        requesterId,
        receiverId,
        status: 'PENDING',
      },
    });

    // Get requester name for the notification message
    //* eslint-disable @typescript-eslint/no-unsafe-assignment */
    const requester = await this.prisma.user.findUnique({
      where: { id: requesterId },
      select: { name: true },
    });

    await this.prisma.notification.create({
      data: {
        type: 'FRIEND_REQUEST',
        message: `${requester?.name || 'Someone'} sent you a friend request`,
        userId: receiverId,
        requesterId,
      },
    });

    return friendship;
  }

  async respondToFriendRequest(
    userId: string,
    friendshipId: string,
    action: 'ACCEPT' | 'REJECT',
  ) {
    let friendship = await this.prisma.friendship.findUnique({
      where: { id: friendshipId },
      include: { receiver: true, requester: true },
    });

    // Fallback: search by requesterId if the provided friendshipId is not found
    // This handles cases where the frontend passes notification.requesterId
    if (
      !friendship ||
      friendship.receiverId !== userId ||
      friendship.status !== 'PENDING'
    ) {
      friendship = await this.prisma.friendship.findFirst({
        where: {
          receiverId: userId,
          requesterId: friendshipId,
          status: 'PENDING',
        },
        include: { receiver: true, requester: true },
      });
    }

    if (!friendship) {
      throw new NotFoundException('Friend request not found');
    }

    if (action === 'REJECT') {
      await this.prisma.friendship.update({
        where: { id: friendship.id },
        data: { status: 'REJECTED' },
      });

      // Mark the request notification as read
      await this.prisma.notification.updateMany({
        where: {
          userId,
          requesterId: friendship.requesterId,
          type: 'FRIEND_REQUEST',
          read: false,
        },
        data: { read: true },
      });

      return { message: 'Friend request rejected' };
    }

    const updatedFriendship = await this.prisma.friendship.update({
      where: { id: friendship.id },
      data: { status: 'ACCEPTED' },
    });

    // Mark the request notification as read
    await this.prisma.notification.updateMany({
      where: {
        userId,
        requesterId: friendship.requesterId,
        type: 'FRIEND_REQUEST',
        read: false,
      },
      data: { read: true },
    });

    // Create notification for the requester
    await this.prisma.notification.create({
      data: {
        type: 'FRIEND_ACCEPTED',
        message: `${friendship.receiver.name} accepted your friend request`,
        userId: friendship.requesterId,
        requesterId: userId,
      },
    });

    return updatedFriendship;
  }

  async getFriendships(
    userId: string,
    type: 'SENT' | 'RECEIVED' | 'ACCEPTED',
  ): Promise<FriendshipWithUser[]> {
    const friendships = await this.prisma.friendship.findMany({
      where:
        type === 'SENT'
          ? { requesterId: userId, status: 'PENDING' }
          : type === 'RECEIVED'
            ? { receiverId: userId, status: 'PENDING' }
            : {
                status: 'ACCEPTED',
                OR: [{ requesterId: userId }, { receiverId: userId }],
              },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePhoto: true,
            gender: true,
            birthDate: true,
            createdAt: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePhoto: true,
            gender: true,
            birthDate: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return friendships.map((f) => {
      let friend;
      if (type === 'SENT') {
        friend = f.receiver;
      } else if (type === 'RECEIVED') {
        friend = f.requester;
      } else {
        // For ACCEPTED, the friend is the one who ISN'T the current user
        friend = f.requesterId === userId ? f.receiver : f.requester;
      }

      return {
        id: f.id,
        status: f.status,
        createdAt: f.createdAt,
        user: friend as SafeUser,
      };
    });
  }

  async cancelFriendRequest(userId: string, friendshipId: string) {
    const friendship = await this.prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship) {
      throw new NotFoundException('Friend request not found');
    }

    if (friendship.requesterId !== userId) {
      throw new ConflictException('You can only cancel requests you sent');
    }

    if (friendship.status !== 'PENDING') {
      throw new ConflictException('Can only cancel pending requests');
    }

    await this.prisma.friendship.delete({
      where: { id: friendshipId },
    });

    // Also clear the notification sent to the receiver
    await this.prisma.notification.deleteMany({
      where: {
        userId: friendship.receiverId,
        requesterId: userId,
        type: 'FRIEND_REQUEST',
      },
    });

    return { message: 'Friend request cancelled' };
  }

  async unfriend(userId: string, friendshipId: string) {
    const friendship = await this.prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship) {
      throw new NotFoundException('Friendship not found');
    }

    if (friendship.requesterId !== userId && friendship.receiverId !== userId) {
      throw new ConflictException('You can only remove your own friendships');
    }

    if (friendship.status !== 'ACCEPTED') {
      throw new ConflictException('Can only unfriend accepted connections');
    }

    await this.prisma.friendship.delete({
      where: { id: friendshipId },
    });

    return { message: 'Friend removed' };
  }

  async isFriend(userId1: string, userId2: string): Promise<boolean> {
    const friendship = await this.prisma.friendship.findFirst({
      where: {
        status: 'ACCEPTED',
        OR: [
          { requesterId: userId1, receiverId: userId2 },
          { requesterId: userId2, receiverId: userId1 },
        ],
      },
    });
    return !!friendship;
  }

  async getPublicProfile(id: string): Promise<UserWithRelations> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        gender: true,
        birthDate: true,
        profilePhoto: true,
        socialLinks: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      ...user,
      jobApplications: [], // Exclude job applications for public profile
    };
  }

  async getDashboardStats(userId: string) {
    const [
      appStats,
      totalFriends,
      pendingReceived,
      unreadNotifications,
      userWithResume,
    ] = await Promise.all([
      // Job Application Stats
      this.prisma.jobApplication.groupBy({
        by: ['status'],
        where: { userId },
        _count: true,
      }),
      // Total Friends
      this.prisma.friendship.count({
        where: {
          status: 'ACCEPTED',
          OR: [{ requesterId: userId }, { receiverId: userId }],
        },
      }),
      // Pending Friend Requests Received
      this.prisma.friendship.count({
        where: {
          receiverId: userId,
          status: 'PENDING',
        },
      }),
      // Unread Notifications
      this.prisma.notification.count({
        where: {
          userId,
          read: false,
        },
      }),
      // Resume Completeness Check
      this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          resume: {
            include: {
              education: true,
              experience: true,
              skills: true,
            },
          },
        },
      }),
    ]);

    // Calculate resume completeness
    let completeness = 0;
    if (userWithResume?.resume) {
      const resume = userWithResume.resume;
      if (resume.summary) completeness += 25;
      if (resume.education.length > 0) completeness += 25;
      if (resume.experience.length > 0) completeness += 25;
      if (resume.skills.length > 0) completeness += 25;
    }

    return {
      jobApplications: appStats.map((stat) => ({
        status: stat.status,
        count: stat._count,
      })),
      totalFriends,
      pendingFriends: pendingReceived,
      unreadNotifications,
      resumeCompleteness: completeness,
    };
  }
}
