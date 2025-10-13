import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsString, MinLength, MaxLength, IsArray, IsBoolean } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsString({ message: 'Primeiro nome deve ser uma string' })
  @MinLength(2, { message: 'Primeiro nome deve ter no mínimo 2 caracteres' })
  @MaxLength(50, { message: 'Primeiro nome deve ter no máximo 50 caracteres' })
  firstName?: string;

  @IsOptional()
  @IsString({ message: 'Sobrenome deve ser uma string' })
  @MinLength(2, { message: 'Sobrenome deve ter no mínimo 2 caracteres' })
  @MaxLength(50, { message: 'Sobrenome deve ter no máximo 50 caracteres' })
  lastName?: string;

  @IsOptional()
  @IsString({ message: 'Username deve ser uma string' })
  @MinLength(3, { message: 'Username deve ter no mínimo 3 caracteres' })
  @MaxLength(30, { message: 'Username deve ter no máximo 30 caracteres' })
  username?: string;

  @IsOptional()
  @IsArray({ message: 'Roles deve ser um array' })
  @IsString({ each: true, message: 'Cada role deve ser uma string' })
  roles?: string[];

  @IsOptional()
  @IsBoolean({ message: 'isActive deve ser um booleano' })
  isActive?: boolean;
}
