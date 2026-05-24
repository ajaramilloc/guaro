import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { Role, Team } from '@prisma/client';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsEnum(Role)
  role: Role;

  @IsEnum(Team)
  team: Team;

  @IsOptional()
  @IsString()
  moduleId?: string;
}
