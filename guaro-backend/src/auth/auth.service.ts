import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleUserDto } from './dto/auth.dto';
import { Role, Team } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async findOrCreateUser(googleUser: GoogleUserDto) {
    let user = await this.prisma.user.findUnique({
      where: { email: googleUser.email },
      include: { bpoProfile: true, adminProfile: true },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: googleUser.email,
          name: googleUser.name,
          avatarUrl: googleUser.avatarUrl,
          googleId: googleUser.googleId,
          role: Role.USER,
          team: Team.COMMERCIAL,
        },
        include: { bpoProfile: true, adminProfile: true },
      });
    } else if (googleUser.googleId && !user.googleId) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: googleUser.googleId,
          avatarUrl: googleUser.avatarUrl,
        },
        include: { bpoProfile: true, adminProfile: true },
      });
    }

    return user;
  }

  generateToken(userId: string, email: string) {
    return this.jwt.sign({ sub: userId, email });
  }

  async validateInvitation(token: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { token },
    });

    if (!invitation) return null;
    if (invitation.usedAt) return null;
    if (invitation.expiresAt < new Date()) return null;

    return invitation;
  }
}
