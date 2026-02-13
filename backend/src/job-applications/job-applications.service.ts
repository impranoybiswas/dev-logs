import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';
import { UpdateJobApplicationDto } from './dto/update-job-application.dto';

@Injectable()
export class JobApplicationsService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: string,
    createJobApplicationDto: CreateJobApplicationDto,
  ) {
    const { appliedAt, ...data } = createJobApplicationDto;
    return this.prisma.jobApplication.create({
      data: {
        ...data,
        appliedAt: new Date(appliedAt),
        userId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.jobApplication.findMany({
      where: { userId },
      orderBy: { appliedAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const jobApplication = await this.prisma.jobApplication.findUnique({
      where: { id },
    });

    if (!jobApplication) {
      throw new NotFoundException('Job application not found');
    }

    if (jobApplication.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to access this job application',
      );
    }

    return jobApplication;
  }

  async update(
    userId: string,
    id: string,
    updateJobApplicationDto: UpdateJobApplicationDto,
  ) {
    await this.findOne(userId, id);

    const { appliedAt, ...data } = updateJobApplicationDto;
    return this.prisma.jobApplication.update({
      where: { id },
      data: {
        ...data,
        appliedAt: appliedAt ? new Date(appliedAt) : undefined,
      },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);

    return this.prisma.jobApplication.delete({
      where: { id },
    });
  }
}
