import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateMerchantDto {
  @IsString()
  name: string;
}

export class UpdateMerchantDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
