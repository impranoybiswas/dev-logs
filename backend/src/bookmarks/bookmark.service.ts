import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Bookmark } from '@prisma/client';
import { CreateBookmarkDto } from './dto/bookmark.dto';

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: CreateBookmarkDto): Promise<Bookmark> {
    return await this.prisma.bookmark.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async findAll(userId: string): Promise<Bookmark[]> {
    return await this.prisma.bookmark.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(userId: string, id: string): Promise<Bookmark> {
    return await this.prisma.bookmark.delete({
      where: { id, userId },
    });
  }

  async bulkSync(
    userId: string,
    bookmarks: CreateBookmarkDto[],
  ): Promise<Bookmark[]> {
    const results: Bookmark[] = [];
    for (const b of bookmarks) {
      // Avoid duplicates by checking URL
      const exists = await this.prisma.bookmark.findFirst({
        where: { userId, url: b.url },
      });
      if (!exists) {
        const created = await this.prisma.bookmark.create({
          data: {
            title: b.title,
            url: b.url,
            category: b.category,
            favicon: b.favicon,
            userId,
          },
        });
        results.push(created);
      }
    }
    return results;
  }
}
