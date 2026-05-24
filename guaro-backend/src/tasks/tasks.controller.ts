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
import { TasksService } from './tasks.service';
import {
  CreateTaskDto,
  BlockTaskDto,
  AddCommentDto,
  TaskQueryDto,
} from './dto/task.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TasksController {
  constructor(private tasks: TasksService) {}

  @Get()
  findAll(@Query() query: TaskQueryDto) {
    return this.tasks.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasks.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateTaskDto, @CurrentUser() user: any) {
    return this.tasks.create(dto, user.id);
  }

  @Patch(':id/start')
  start(@Param('id') id: string, @CurrentUser() user: any) {
    return this.tasks.startTask(id, user.id);
  }

  @Patch(':id/complete')
  complete(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() body: { result?: Record<string, unknown> },
  ) {
    return this.tasks.completeTask(id, user.id, body.result);
  }

  @Patch(':id/block')
  block(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: BlockTaskDto,
  ) {
    return this.tasks.blockTask(id, user.id, dto);
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @CurrentUser() user: any) {
    return this.tasks.cancelTask(id, user.id, user.role);
  }

  @Post(':id/comments')
  addComment(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: AddCommentDto,
  ) {
    return this.tasks.addComment(id, user.id, dto);
  }
}
