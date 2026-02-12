import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class CreateJobApplicationDto {
  @IsString()
  @IsNotEmpty()
  company: string;

  @IsString()
  @IsNotEmpty()
  role: string;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsDateString()
  @IsNotEmpty()
  appliedAt: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
