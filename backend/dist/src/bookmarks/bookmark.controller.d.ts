import { BookmarkService } from './bookmark.service';
import type { Bookmark } from '@prisma/client';
import { CreateBookmarkDto } from './dto/bookmark.dto';
import type { RequestWithUser } from '../auth/interfaces/request-with-user.interface';
export declare class BookmarkController {
    private readonly bookmarkService;
    constructor(bookmarkService: BookmarkService);
    create(req: RequestWithUser, data: CreateBookmarkDto): Promise<Bookmark>;
    findAll(req: RequestWithUser): Promise<Bookmark[]>;
    remove(req: RequestWithUser, id: string): Promise<Bookmark>;
    update(req: RequestWithUser, id: string, data: Partial<CreateBookmarkDto>): Promise<Bookmark>;
    bulkSync(req: RequestWithUser, bookmarks: CreateBookmarkDto[]): Promise<Bookmark[]>;
}
