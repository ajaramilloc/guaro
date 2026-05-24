import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { StoreStatus } from '@prisma/client';

export class CreateStoreDto {
  @IsString()
  brandId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  externalId?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsString()
  country: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsEnum(StoreStatus)
  status?: StoreStatus;

  @IsOptional()
  @IsString()
  hoursMonday?: string;

  @IsOptional()
  @IsString()
  hoursTuesday?: string;

  @IsOptional()
  @IsString()
  hoursWednesday?: string;

  @IsOptional()
  @IsString()
  hoursThursday?: string;

  @IsOptional()
  @IsString()
  hoursFriday?: string;

  @IsOptional()
  @IsString()
  hoursSaturday?: string;

  @IsOptional()
  @IsString()
  hoursSunday?: string;
}

export class UpdateStoreDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  externalId?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsEnum(StoreStatus)
  status?: StoreStatus;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  hoursMonday?: string;

  @IsOptional()
  @IsString()
  hoursTuesday?: string;

  @IsOptional()
  @IsString()
  hoursWednesday?: string;

  @IsOptional()
  @IsString()
  hoursThursday?: string;

  @IsOptional()
  @IsString()
  hoursFriday?: string;

  @IsOptional()
  @IsString()
  hoursSaturday?: string;

  @IsOptional()
  @IsString()
  hoursSunday?: string;
}
