import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSocialLinkDto } from './dto/create-social-link.dto';

@Injectable()
export class SocialLinksService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createSocialLinkDto: CreateSocialLinkDto) {
    return this.prisma.socialLink.create({
      data: {
        ...createSocialLinkDto,
        userId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.socialLink.findMany({
      where: { userId },
    });
  }

  async update(
    userId: string,
    id: string,
    updateData: Partial<CreateSocialLinkDto>,
  ) {
    const socialLink = await this.prisma.socialLink.findUnique({
      where: { id },
    });

    if (!socialLink) {
      throw new NotFoundException('Social link not found');
    }

    if (socialLink.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to update this social link',
      );
    }

    return this.prisma.socialLink.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(userId: string, id: string) {
    const socialLink = await this.prisma.socialLink.findUnique({
      where: { id },
    });

    if (!socialLink) {
      throw new NotFoundException('Social link not found');
    }

    if (socialLink.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this social link',
      );
    }

    return this.prisma.socialLink.delete({
      where: { id },
    });
  }
}
