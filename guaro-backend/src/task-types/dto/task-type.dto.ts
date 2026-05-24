import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { AssignmentStrategy, ExecutionMode } from '@prisma/client';

export class CreateTaskTypeDto {
  @IsString()
  sectionId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(ExecutionMode)
  executionMode: ExecutionMode;

  @IsOptional()
  @IsObject()
  formSchema?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  workflowDefinition?: Record<string, unknown>;

  @IsOptional()
  @IsEnum(AssignmentStrategy)
  assignmentStrategy?: AssignmentStrategy;

  @IsOptional()
  assignmentPool?: unknown[];

  @IsOptional()
  @IsNumber()
  estimatedWeight?: number;

  @IsOptional()
  @IsNumber()
  slaHours?: number;

  @IsOptional()
  @IsNumber()
  maxConcurrentPerBpo?: number;

  @IsOptional()
  @IsNumber()
  retryAttempts?: number;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class UpdateTaskTypeDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ExecutionMode)
  executionMode?: ExecutionMode;

  @IsOptional()
  @IsObject()
  formSchema?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  workflowDefinition?: Record<string, unknown>;

  @IsOptional()
  @IsEnum(AssignmentStrategy)
  assignmentStrategy?: AssignmentStrategy;

  @IsOptional()
  assignmentPool?: unknown[];

  @IsOptional()
  @IsNumber()
  estimatedWeight?: number;

  @IsOptional()
  @IsNumber()
  slaHours?: number;

  @IsOptional()
  @IsNumber()
  maxConcurrentPerBpo?: number;

  @IsOptional()
  @IsNumber()
  retryAttempts?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}
