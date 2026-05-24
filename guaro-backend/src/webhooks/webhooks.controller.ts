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
import { WebhooksService } from './webhooks.service';
import { CreateWebhookDto, UpdateWebhookDto } from './dto/webhook.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('webhooks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WebhooksController {
  constructor(private webhooks: WebhooksService) {}

  @Get()
  findAll(@Query('sectionId') sectionId?: string) {
    return this.webhooks.findAll(sectionId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.webhooks.findOne(id);
  }

  @Post()
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  create(@Body() dto: CreateWebhookDto) {
    return this.webhooks.create(dto);
  }

  @Patch(':id')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateWebhookDto) {
    return this.webhooks.update(id, dto);
  }

  @Post(':id/test')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  sendTest(@Param('id') id: string) {
    return this.webhooks.sendTest(id);
  }
}
