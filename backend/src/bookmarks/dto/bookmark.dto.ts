import { IsString, IsOptional } from 'class-validator';

export class CreateBookmarkDto {
  @IsString()
  title: string;

  @IsString()
  url: string;

  @IsString()
  category: string;

  @IsString()
  @IsOptional()
  favicon?: string;
}
