import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStoreDto, UpdateStoreDto } from './dto/store.dto';
import { Role } from '@prisma/client';

@Injectable()
export class StoresService {
  constructor(private prisma: PrismaService) {}

  findAll(brandId?: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const where = brandId ? { brandId } : {};

    return Promise.all([
      this.prisma.store.findMany({
        where,
        include: { brand: { include: { merchant: true } } },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.store.count({ where }),
    ]).then(([data, total]) => ({
      data,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    }));
  }

  async findOne(id: string) {
    const store = await this.prisma.store.findUnique({
      where: { id },
      include: {
        brand: { include: { merchant: true } },
      },
    });
    if (!store) throw new NotFoundException('Store not found');
    return store;
  }

  async create(
    dto: CreateStoreDto,
    requestingUser: {
      id: string;
      role: Role;
      bpoProfile?: { id: string } | null;
    },
  ) {
    await this.checkStorePermission(dto.brandId, requestingUser);

    return this.prisma.store.create({
      data: dto,
      include: { brand: true },
    });
  }

  async update(
    id: string,
    dto: UpdateStoreDto,
    requestingUser: {
      id: string;
      role: Role;
      bpoProfile?: { id: string } | null;
    },
  ) {
    const store = await this.findOne(id);
    await this.checkStorePermission(store.brandId, requestingUser);

    return this.prisma.store.update({
      where: { id },
      data: dto,
      include: { brand: true },
    });
  }

  private async checkStorePermission(
    brandId: string,
    user: { id: string; role: Role; bpoProfile?: { id: string } | null },
  ) {
    // Superadmin and admin always allowed
    if (user.role === Role.SUPERADMIN || user.role === Role.ADMIN) return;

    const brand = await this.prisma.brand.findUnique({
      where: { id: brandId },
    });
    if (!brand) throw new NotFoundException('Brand not found');

    if (!user.bpoProfile) {
      throw new ForbiddenException(
        'No permission to manage stores for this brand',
      );
    }

    // OP of the brand
    if (brand.assignedOpId === user.bpoProfile.id) return;

    // BPO with an active task for this brand
    const activeTask = await this.prisma.task.findFirst({
      where: {
        brandId,
        assignedBpoId: user.bpoProfile.id,
        status: { in: ['PENDING', 'IN_PROGRESS'] },
      },
    });
    if (activeTask) return;

    throw new ForbiddenException(
      'You do not have permission to manage stores for this brand',
    );
  }
}
