import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private users: UsersService) {}

  @Get()
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  findAll(@CurrentUser() user: any) {
    return this.users.findAll(user);
  }

  @Get('me')
  me(@CurrentUser() user: any) {
    return user;
  }

  @Get(':id')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  findOne(@Param('id') id: string) {
    return this.users.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.SUPERADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.users.update(id, dto);
  }

  @Patch(':id/toggle-active')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  toggleActive(@Param('id') id: string) {
    return this.users.toggleActive(id);
  }

  @Post('invitations')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  generateInvitation(
    @CurrentUser() user: any,
    @Body() body: { role: Role; team: string; moduleId?: string },
  ) {
    return this.users.generateInvitation(
      user.id,
      body.role,
      body.team,
      body.moduleId,
    );
  }

  @Get('invitations/list')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  findInvitations(@CurrentUser() user: any) {
    return this.users.findInvitations(user);
  }
}
