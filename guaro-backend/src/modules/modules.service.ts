import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateModuleDto, UpdateModuleDto } from './dto/module.dto';

@Injectable()
export class ModulesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.module.findMany({
      include: {
        sections: {
          include: { taskTypes: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findOne(id: string) {
    const module = await this.prisma.module.findUnique({
      where: { id },
      include: {
        sections: {
          include: { taskTypes: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
    if (!module) throw new NotFoundException('Module not found');
    return module;
  }

  create(dto: CreateModuleDto) {
    return this.prisma.module.create({ data: dto });
  }

  async update(id: string, dto: UpdateModuleDto) {
    await this.findOne(id);
    return this.prisma.module.update({ where: { id }, data: dto });
  }
}
