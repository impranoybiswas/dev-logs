import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { ResumeService, Resume } from './resume.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('resume')
@UseGuards(JwtAuthGuard)
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  @Get()
  async getResume(@Request() req): Promise<Resume | null> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return this.resumeService.getResume(req.user.id as string);
  }

  @Put()
  async updateResume(@Request() req, @Body() data: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return this.resumeService.upsertResume(req.user.id as string, data);
  }
}
