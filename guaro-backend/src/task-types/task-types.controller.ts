import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TaskTypesService } from './task-types.service';
import { CreateTaskTypeDto, UpdateTaskTypeDto } from './dto/task-type.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('task-types')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TaskTypesController {
  constructor(private taskTypes: TaskTypesService) {}

  @Get()
  findAll(@Query('sectionId') sectionId?: string) {
    return this.taskTypes.findAll(sectionId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.taskTypes.findOne(id);
  }

  @Post()
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  create(@Body() dto: CreateTaskTypeDto) {
    return this.taskTypes.create(dto);
  }

  @Patch(':id')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateTaskTypeDto) {
    return this.taskTypes.update(id, dto);
  }
}
