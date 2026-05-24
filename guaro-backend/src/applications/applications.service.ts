import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateApplicationDto,
  UpdateApplicationDto,
} from './dto/application.dto';

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

  findAll(country?: string) {
    return this.prisma.application.findMany({
      where: country ? { country } : {},
      orderBy: { appName: 'asc' },
    });
  }

  async findOne(id: string) {
    const app = await this.prisma.application.findUnique({
      where: { id },
      include: {
        brands: {
          include: { brand: true },
        },
      },
    });
    if (!app) throw new NotFoundException('Application not found');
    return app;
  }

  create(dto: CreateApplicationDto) {
    return this.prisma.application.create({ data: dto });
  }

  async update(id: string, dto: UpdateApplicationDto) {
    await this.findOne(id);
    return this.prisma.application.update({ where: { id }, data: dto });
  }
}
