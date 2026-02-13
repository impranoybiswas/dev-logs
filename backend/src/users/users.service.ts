import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
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
}

export interface UserWithRelations extends SafeUser {
  socialLinks: any[];
  jobApplications: any[];
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

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

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(id: string, data: UpdateProfileDto): Promise<SafeUser> {
    const updateData: any = { ...data };
    if (updateData.birthDate) {
      updateData.birthDate = new Date(updateData.birthDate);
    }

    return await this.prisma.user.update({
      where: { id },
      data: updateData,
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
}
