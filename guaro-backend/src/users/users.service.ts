import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '@prisma/client';
import { randomBytes } from 'crypto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(requestingUser: { role: Role; team: string }) {
    const where =
      requestingUser.role === 'SUPERADMIN'
        ? {}
        : { team: requestingUser.team as any };

    return this.prisma.user.findMany({
      where,
      include: { bpoProfile: true, adminProfile: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { bpoProfile: true, adminProfile: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.findOne(id);

    return this.prisma.user.update({
      where: { id },
      data: {
        role: dto.role,
        team: dto.team,
        isActive: dto.isActive,
        adminProfile:
          dto.moduleId !== undefined
            ? {
                upsert: {
                  create: { moduleId: dto.moduleId },
                  update: { moduleId: dto.moduleId },
                },
              }
            : undefined,
      },
      include: { bpoProfile: true, adminProfile: true },
    });
  }

  async toggleActive(id: string) {
    const user = await this.findOne(id);
    return this.prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      include: { bpoProfile: true, adminProfile: true },
    });
  }

  async generateInvitation(
    createdById: string,
    role: Role,
    team: string,
    moduleId?: string,
  ) {
    const token = randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    return this.prisma.invitation.create({
      data: {
        token,
        role,
        team: team as any,
        moduleId,
        createdById,
        expiresAt,
      },
    });
  }

  async findInvitations(requestingUser: { role: Role; team: string }) {
    const where =
      requestingUser.role === 'SUPERADMIN'
        ? {}
        : { team: requestingUser.team as any };

    return this.prisma.invitation.findMany({
      where,
      include: { createdBy: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
