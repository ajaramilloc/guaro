import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBrandDto, UpdateBrandDto, BrandQueryDto } from './dto/brand.dto';

const BRAND_INCLUDE = {
  merchant: true,
  parent: true,
  children: {
    include: {
      stores: true,
      applications: { include: { application: true } },
    },
  },
  applications: { include: { application: true } },
  assignedOp: { include: { user: true } },
  stores: true,
};

@Injectable()
export class BrandsService {
  constructor(private prisma: PrismaService) {}

  findAll(query: BrandQueryDto) {
    const where: any = {};
    const page = query.page ? parseInt(query.page) : 1;
    const limit = query.limit ? parseInt(query.limit) : 25;
    const skip = (page - 1) * limit;

    if (query.country) where.country = query.country;
    if (query.kaType) where.kaType = query.kaType;
    if (query.status) where.status = query.status;
    if (query.merchantId) where.merchantId = query.merchantId;
    if (query.assignedOpId) where.assignedOpId = query.assignedOpId;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { merchant: { name: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    return Promise.all([
      this.prisma.brand.findMany({
        where,
        include: BRAND_INCLUDE,
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.brand.count({ where }),
    ]).then(([data, total]) => ({
      data,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    }));
  }

  async findOne(id: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
      include: {
        merchant: true,
        parent: true,
        children: {
          include: {
            stores: true,
            applications: { include: { application: true } },
          },
        },
        applications: { include: { application: true } },
        assignedOp: { include: { user: true } },
        stores: true,
        tasks: {
          include: {
            taskType: { include: { section: true } },
            assignedBpo: { include: { user: true } },
            createdBy: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });
    if (!brand) throw new NotFoundException('Brand not found');
    return brand;
  }

  async create(dto: CreateBrandDto) {
    const { applicationId, ...data } = dto;

    const brand = await this.prisma.brand.create({
      data: {
        ...data,
        isSubBrand: data.isSubBrand ?? false,
      },
      include: {
        merchant: true,
        applications: { include: { application: true } },
      },
    });

    if (applicationId) {
      await this.prisma.brandApplication.create({
        data: {
          brandId: brand.id,
          applicationId,
          isPrimary: true,
        },
      });
    }

    return this.findOne(brand.id);
  }

  async update(id: string, dto: UpdateBrandDto) {
    await this.findOne(id);

    const { applicationId, ...data } = dto;

    if (applicationId) {
      await this.prisma.brandApplication.upsert({
        where: {
          brandId_applicationId: {
            brandId: id,
            applicationId,
          },
        },
        create: { brandId: id, applicationId, isPrimary: true },
        update: { isPrimary: true },
      });
    }

    return this.prisma.brand.update({
      where: { id },
      data,
      include: {
        merchant: true,
        applications: { include: { application: true } },
        assignedOp: { include: { user: true } },
        stores: true,
      },
    });
  }
}
