import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import {
  KaType,
  PickingMode,
  PaymentMode,
  MenuMethod,
  BrandStatus,
} from '@prisma/client';

export class CreateBrandDto {
  @IsString()
  name: string;

  @IsString()
  merchantId: string;

  @IsEnum(KaType)
  kaType: KaType;

  @IsString()
  country: string;

  @IsOptional()
  @IsBoolean()
  isSubBrand?: boolean;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsOptional()
  @IsEnum(PickingMode)
  pickingMode?: PickingMode;

  @IsOptional()
  @IsEnum(PaymentMode)
  paymentMode?: PaymentMode;

  @IsOptional()
  @IsEnum(MenuMethod)
  menuMethod?: MenuMethod;

  @IsOptional()
  @IsString()
  applicationId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateBrandDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  externalId?: string;

  @IsOptional()
  @IsEnum(PickingMode)
  pickingMode?: PickingMode;

  @IsOptional()
  @IsEnum(PaymentMode)
  paymentMode?: PaymentMode;

  @IsOptional()
  @IsEnum(MenuMethod)
  menuMethod?: MenuMethod;

  @IsOptional()
  @IsEnum(BrandStatus)
  status?: BrandStatus;

  @IsOptional()
  @IsString()
  applicationId?: string;

  @IsOptional()
  @IsString()
  assignedOpId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class BrandQueryDto {
  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsEnum(KaType)
  kaType?: KaType;

  @IsOptional()
  @IsEnum(BrandStatus)
  status?: BrandStatus;

  @IsOptional()
  @IsString()
  merchantId?: string;

  @IsOptional()
  @IsString()
  assignedOpId?: string;

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
