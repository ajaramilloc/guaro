import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSectionDto, UpdateSectionDto } from './dto/section.dto';

@Injectable()
export class SectionsService {
  constructor(private prisma: PrismaService) {}

  findAll(moduleId?: string) {
    return this.prisma.section.findMany({
      where: moduleId ? { moduleId } : {},
      include: { taskTypes: true, module: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findOne(id: string) {
    const section = await this.prisma.section.findUnique({
      where: { id },
      include: { taskTypes: true, module: true },
    });
    if (!section) throw new NotFoundException('Section not found');
    return section;
  }

  create(dto: CreateSectionDto) {
    return this.prisma.section.create({
      data: dto,
      include: { module: true },
    });
  }

  async update(id: string, dto: UpdateSectionDto) {
    await this.findOne(id);
    return this.prisma.section.update({
      where: { id },
      data: dto,
      include: { module: true },
    });
  }
}
