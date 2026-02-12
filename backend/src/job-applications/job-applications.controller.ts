import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JobApplicationsService } from './job-applications.service';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';
import { UpdateJobApplicationDto } from './dto/update-job-application.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
  };
}

@Controller('job-applications')
@UseGuards(JwtAuthGuard)
export class JobApplicationsController {
  constructor(
    private readonly jobApplicationsService: JobApplicationsService,
  ) {}

  @Post()
  create(
    @Request() req: AuthenticatedRequest,
    @Body() createJobApplicationDto: CreateJobApplicationDto,
  ) {
    return this.jobApplicationsService.create(
      req.user.userId,
      createJobApplicationDto,
    );
  }

  @Get()
  findAll(@Request() req: AuthenticatedRequest) {
    return this.jobApplicationsService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.jobApplicationsService.findOne(req.user.userId, id);
  }

  @Patch(':id')
  update(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() updateJobApplicationDto: UpdateJobApplicationDto,
  ) {
    return this.jobApplicationsService.update(
      req.user.userId,
      id,
      updateJobApplicationDto,
    );
  }

  @Delete(':id')
  remove(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.jobApplicationsService.remove(req.user.userId, id);
  }
}
