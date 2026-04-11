import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BookmarkService } from './bookmark.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Bookmark } from '@prisma/client';
import { CreateBookmarkDto } from './dto/bookmark.dto';
import type { RequestWithUser } from '../auth/interfaces/request-with-user.interface';

@Controller('bookmarks')
@UseGuards(JwtAuthGuard)
export class BookmarkController {
  constructor(private readonly bookmarkService: BookmarkService) {}

  @Post()
  async create(
    @Request() req: RequestWithUser,
    @Body() data: CreateBookmarkDto,
  ): Promise<Bookmark> {
    return await this.bookmarkService.create(req.user.id, data);
  }

  @Get()
  async findAll(@Request() req: RequestWithUser): Promise<Bookmark[]> {
    return await this.bookmarkService.findAll(req.user.id);
  }

  @Delete(':id')
  async remove(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
  ): Promise<Bookmark> {
    return await this.bookmarkService.remove(req.user.id, id);
  }

  @Post('sync')
  async bulkSync(
    @Request() req: RequestWithUser,
    @Body() bookmarks: CreateBookmarkDto[],
  ): Promise<Bookmark[]> {
    if (!Array.isArray(bookmarks)) return [];
    return await this.bookmarkService.bulkSync(req.user.id, bookmarks);
  }
}
