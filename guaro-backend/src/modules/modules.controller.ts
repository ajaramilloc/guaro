import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ModulesService } from './modules.service';
import { CreateModuleDto, UpdateModuleDto } from './dto/module.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('modules')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ModulesController {
  constructor(private modules: ModulesService) {}

  @Get()
  findAll() {
    return this.modules.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.modules.findOne(id);
  }

  @Post()
  @Roles(Role.SUPERADMIN)
  create(@Body() dto: CreateModuleDto) {
    return this.modules.create(dto);
  }

  @Patch(':id')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateModuleDto) {
    return this.modules.update(id, dto);
  }
}
