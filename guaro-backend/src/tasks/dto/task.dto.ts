import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { InputType, TaskStatus } from '@prisma/client';

export class CreateTaskDto {
  @IsString()
  taskTypeId: string;

  @IsString()
  brandId: string;

  @IsOptional()
  @IsEnum(InputType)
  inputType?: InputType;

  @IsOptional()
  @IsString()
  inputValue?: string;

  @IsOptional()
  @IsObject()
  formData?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  priority?: string;
}

export class UpdateTaskDto {
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsString()
  blockReason?: string;

  @IsOptional()
  @IsObject()
  result?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  assignedBpoId?: string;
}

export class BlockTaskDto {
  @IsString()
  blockReason: string;
}

export class AddCommentDto {
  @IsString()
  body: string;
}

export class TaskQueryDto {
  @IsOptional()
  @IsString()
  brandId?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsString()
  assignedBpoId?: string;

  @IsOptional()
  @IsString()
  createdById?: string;

  @IsOptional()
  @IsString()
  taskTypeId?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;
}
