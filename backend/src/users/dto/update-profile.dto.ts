import {
  IsString,
  IsOptional,
  IsUrl,
  IsEnum,
  IsDateString,
} from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsUrl()
  @IsOptional()
  profilePhoto?: string;

  @IsEnum(['male', 'female', 'other'])
  @IsOptional()
  gender?: string;

  @IsDateString()
  @IsOptional()
  birthDate?: string;
}
