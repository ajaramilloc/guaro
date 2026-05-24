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
import { SectionsService } from './sections.service';
import { CreateSectionDto, UpdateSectionDto } from './dto/section.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('sections')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SectionsController {
  constructor(private sections: SectionsService) {}

  @Get()
  findAll(@Query('moduleId') moduleId?: string) {
    return this.sections.findAll(moduleId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sections.findOne(id);
  }

  @Post()
  @Roles(Role.SUPERADMIN)
  create(@Body() dto: CreateSectionDto) {
    return this.sections.create(dto);
  }

  @Patch(':id')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateSectionDto) {
    return this.sections.update(id, dto);
  }
}
