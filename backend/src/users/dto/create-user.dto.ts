import { IsEmail, IsNotEmpty, IsOptional, IsString, IsArray, IsBoolean, MinLength, MaxLength } from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'Keycloak ID deve ser uma string' })
  @IsNotEmpty({ message: 'Keycloak ID é obrigatório' })
  keycloakId: string;

  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email: string;

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
