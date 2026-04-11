import { PrismaService } from '../prisma/prisma.service';
import { Bookmark } from '@prisma/client';
import { CreateBookmarkDto } from './dto/bookmark.dto';
export declare class BookmarkService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, data: CreateBookmarkDto): Promise<Bookmark>;
    findAll(userId: string): Promise<Bookmark[]>;
    remove(userId: string, id: string): Promise<Bookmark>;
    bulkSync(userId: string, bookmarks: CreateBookmarkDto[]): Promise<Bookmark[]>;
}
