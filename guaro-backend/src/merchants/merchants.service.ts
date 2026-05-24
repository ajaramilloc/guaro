import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMerchantDto, UpdateMerchantDto } from './dto/merchant.dto';

@Injectable()
export class MerchantsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.merchant.findMany({
      include: {
        brands: {
          include: {
            applications: { include: { application: true } },
            children: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id },
      include: {
        brands: {
          include: {
            applications: { include: { application: true } },
            stores: true,
            children: true,
          },
        },
      },
    });
    if (!merchant) throw new NotFoundException('Merchant not found');
    return merchant;
  }

  create(dto: CreateMerchantDto) {
    return this.prisma.merchant.create({ data: dto });
  }

  async update(id: string, dto: UpdateMerchantDto) {
    await this.findOne(id);
    return this.prisma.merchant.update({ where: { id }, data: dto });
  }
}
