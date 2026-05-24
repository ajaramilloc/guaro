import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { MerchantsService } from './merchants.service';
import { CreateMerchantDto, UpdateMerchantDto } from './dto/merchant.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('merchants')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MerchantsController {
  constructor(private merchants: MerchantsService) {}

  @Get()
  findAll() {
    return this.merchants.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.merchants.findOne(id);
  }

  @Post()
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.BPO)
  create(@Body() dto: CreateMerchantDto) {
    return this.merchants.create(dto);
  }

  @Patch(':id')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateMerchantDto) {
    return this.merchants.update(id, dto);
  }
}
