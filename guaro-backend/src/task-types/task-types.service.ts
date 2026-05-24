import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskTypeDto, UpdateTaskTypeDto } from './dto/task-type.dto';

@Injectable()
export class TaskTypesService {
  constructor(private prisma: PrismaService) {}

  findAll(sectionId?: string) {
    return this.prisma.taskType.findMany({
      where: sectionId ? { sectionId } : {},
      include: {
        section: { include: { module: true } },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findOne(id: string) {
    const taskType = await this.prisma.taskType.findUnique({
      where: { id },
      include: {
        section: { include: { module: true } },
      },
    });
    if (!taskType) throw new NotFoundException('Task type not found');
    return taskType;
  }

  create(dto: CreateTaskTypeDto) {
    return this.prisma.taskType.create({
      data: {
        ...dto,
        formSchema: dto.formSchema ?? ({} as any),
        workflowDefinition:
          dto.workflowDefinition ?? ({ nodes: [], edges: [] } as any),
        assignmentPool: dto.assignmentPool ?? ([] as any),
      },
      include: {
        section: { include: { module: true } },
      },
    });
  }

  async update(id: string, dto: UpdateTaskTypeDto) {
    await this.findOne(id);
    return this.prisma.taskType.update({
      where: { id },
      data: dto as any,
      include: {
        section: { include: { module: true } },
      },
    });
  }
}
