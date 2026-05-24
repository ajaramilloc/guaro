import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateTaskDto,
  UpdateTaskDto,
  BlockTaskDto,
  AddCommentDto,
  TaskQueryDto,
} from './dto/task.dto';
import { TaskStatus, Role } from '@prisma/client';

const TASK_INCLUDE = {
  taskType: {
    include: {
      section: { include: { module: true } },
    },
  },
  brand: {
    include: {
      merchant: true,
      applications: { include: { application: true } },
    },
  },
  createdBy: true,
  assignedBpo: { include: { user: true } },
  comments: {
    include: { user: true },
    orderBy: { createdAt: 'asc' as const },
  },
};

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  findAll(query: TaskQueryDto) {
    const where: any = {};
    const page = query.page ? parseInt(query.page) : 1;
    const limit = query.limit ? parseInt(query.limit) : 20;
    const skip = (page - 1) * limit;

    if (query.brandId) where.brandId = query.brandId;
    if (query.status) where.status = query.status;
    if (query.assignedBpoId) where.assignedBpoId = query.assignedBpoId;
    if (query.createdById) where.createdById = query.createdById;
    if (query.taskTypeId) where.taskTypeId = query.taskTypeId;
    if (query.search) {
      where.OR = [
        { taskType: { name: { contains: query.search, mode: 'insensitive' } } },
        { brand: { name: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    return Promise.all([
      this.prisma.task.findMany({
        where,
        include: TASK_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.task.count({ where }),
    ]).then(([data, total]) => ({
      data,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    }));
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: TASK_INCLUDE,
    });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async create(dto: CreateTaskDto, userId: string) {
    const taskType = await this.prisma.taskType.findUnique({
      where: { id: dto.taskTypeId },
    });
    if (!taskType) throw new NotFoundException('Task type not found');

    const brand = await this.prisma.brand.findUnique({
      where: { id: dto.brandId },
    });
    if (!brand) throw new NotFoundException('Brand not found');

    // Auto assign BPO based on strategy
    const assignedBpoId = await this.autoAssignBpo(
      taskType.assignmentStrategy,
      taskType.assignmentPool as string[],
      brand.kaType,
      brand.country,
    );

    const task = await this.prisma.task.create({
      data: {
        taskTypeId: dto.taskTypeId,
        brandId: dto.brandId,
        createdById: userId,
        inputType: dto.inputType ?? 'NONE',
        inputValue: dto.inputValue,
        formData: dto.formData ?? ({} as any),
        priority: dto.priority ?? 'normal',
        assignedBpoId,
        assignedAt: assignedBpoId ? new Date() : undefined,
        status: assignedBpoId ? TaskStatus.PENDING : TaskStatus.PENDING,
      },
      include: TASK_INCLUDE,
    });

    // Update BPO active weight
    if (assignedBpoId) {
      await this.prisma.bpoProfile.update({
        where: { id: assignedBpoId },
        data: { activeWeight: { increment: taskType.estimatedWeight } },
      });
    }

    return task;
  }

  async startTask(id: string, bpoUserId: string) {
    const task = await this.findOne(id);

    if (!task.assignedBpo)
      throw new ForbiddenException('Task not assigned to you');

    const bpoProfile = await this.prisma.bpoProfile.findUnique({
      where: { userId: bpoUserId },
    });

    if (!bpoProfile || task.assignedBpoId !== bpoProfile.id) {
      throw new ForbiddenException('Task not assigned to you');
    }

    if (task.status !== TaskStatus.PENDING) {
      throw new BadRequestException('Task is not in PENDING status');
    }

    return this.prisma.task.update({
      where: { id },
      data: {
        status: TaskStatus.IN_PROGRESS,
        startedAt: new Date(),
      },
      include: TASK_INCLUDE,
    });
  }

  async completeTask(
    id: string,
    bpoUserId: string,
    result?: Record<string, unknown>,
  ) {
    const task = await this.findOne(id);

    const bpoProfile = await this.prisma.bpoProfile.findUnique({
      where: { userId: bpoUserId },
    });

    if (!bpoProfile || task.assignedBpoId !== bpoProfile.id) {
      throw new ForbiddenException('Task not assigned to you');
    }

    if (task.status !== TaskStatus.IN_PROGRESS) {
      throw new BadRequestException('Task is not in IN_PROGRESS status');
    }

    const taskType = await this.prisma.taskType.findUnique({
      where: { id: task.taskTypeId },
    });

    // Decrease BPO weight
    if (bpoProfile && taskType) {
      await this.prisma.bpoProfile.update({
        where: { id: bpoProfile.id },
        data: {
          activeWeight: {
            decrement: taskType.estimatedWeight,
          },
        },
      });
    }

    return this.prisma.task.update({
      where: { id },
      data: {
        status: TaskStatus.COMPLETED,
        completedAt: new Date(),
        result: result ?? (undefined as any),
      },
      include: TASK_INCLUDE,
    });
  }

  async blockTask(id: string, bpoUserId: string, dto: BlockTaskDto) {
    const task = await this.findOne(id);

    const bpoProfile = await this.prisma.bpoProfile.findUnique({
      where: { userId: bpoUserId },
    });

    if (!bpoProfile || task.assignedBpoId !== bpoProfile.id) {
      throw new ForbiddenException('Task not assigned to you');
    }

    return this.prisma.task.update({
      where: { id },
      data: {
        status: TaskStatus.BLOCKED,
        blockReason: dto.blockReason,
        blockedAt: new Date(),
      },
      include: TASK_INCLUDE,
    });
  }

  async cancelTask(id: string, userId: string, userRole: Role) {
    const task = await this.findOne(id);

    const canCancel =
      userRole === Role.SUPERADMIN ||
      userRole === Role.ADMIN ||
      task.createdById === userId;

    if (!canCancel) throw new ForbiddenException('Cannot cancel this task');

    if (['COMPLETED', 'CANCELLED'].includes(task.status)) {
      throw new BadRequestException('Task cannot be cancelled');
    }

    // Decrease BPO weight if assigned
    if (task.assignedBpoId) {
      const taskType = await this.prisma.taskType.findUnique({
        where: { id: task.taskTypeId },
      });
      if (taskType) {
        await this.prisma.bpoProfile.update({
          where: { id: task.assignedBpoId },
          data: { activeWeight: { decrement: taskType.estimatedWeight } },
        });
      }
    }

    return this.prisma.task.update({
      where: { id },
      data: { status: TaskStatus.CANCELLED },
      include: TASK_INCLUDE,
    });
  }

  async addComment(id: string, userId: string, dto: AddCommentDto) {
    await this.findOne(id);
    return this.prisma.taskComment.create({
      data: {
        taskId: id,
        userId,
        body: dto.body,
      },
      include: { user: true },
    });
  }

  // ─── Assignment helpers ───────────────────

  private async autoAssignBpo(
    strategy: string,
    pool: string[],
    kaType: string,
    country: string,
  ): Promise<string | null> {
    if (!pool || pool.length === 0) return null;

    if (strategy === 'WEIGHT_BALANCED') {
      return this.weightBalancedAssign(pool);
    }

    if (strategy === 'FIXED') {
      return pool[0] ?? null;
    }

    if (strategy === 'ROUND_ROBIN') {
      return this.roundRobinAssign(pool);
    }

    if (strategy === 'KA_TYPE_BASED') {
      const kaPool = (pool as any)[`pool_${kaType}`] ?? [];
      if (kaType === 'KA') return kaPool[0] ?? null;
      return this.roundRobinAssign(kaPool);
    }

    if (strategy === 'COUNTRY_BASED') {
      const countryPool = (pool as any)[`pool_${country}`] ?? [];
      return this.weightBalancedAssign(countryPool);
    }

    return null;
  }

  private async weightBalancedAssign(pool: string[]): Promise<string | null> {
    if (pool.length === 0) return null;

    const profiles = await this.prisma.bpoProfile.findMany({
      where: { id: { in: pool } },
      orderBy: { activeWeight: 'asc' },
    });

    return profiles[0]?.id ?? null;
  }

  private async roundRobinAssign(pool: string[]): Promise<string | null> {
    if (pool.length === 0) return null;

    const lastTask = await this.prisma.task.findFirst({
      where: { assignedBpoId: { in: pool } },
      orderBy: { assignedAt: 'desc' },
    });

    if (!lastTask?.assignedBpoId) return pool[0];

    const lastIndex = pool.indexOf(lastTask.assignedBpoId);
    const nextIndex = (lastIndex + 1) % pool.length;
    return pool[nextIndex];
  }
}
