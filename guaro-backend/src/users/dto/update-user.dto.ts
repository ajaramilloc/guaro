import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { Role, Team } from '@prisma/client';

export class UpdateUserDto {
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsEnum(Team)
  team?: Team;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  moduleId?: string;
}
