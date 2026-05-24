import { Module } from '@nestjs/common';
import { TaskTypesService } from './task-types.service';
import { TaskTypesController } from './task-types.controller';

@Module({
  providers: [TaskTypesService],
  controllers: [TaskTypesController],
  exports: [TaskTypesService],
})
export class TaskTypesModule {}
