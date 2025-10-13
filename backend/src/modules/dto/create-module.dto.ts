import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsUUID, Min, MinLength, MaxLength } from 'class-validator';

export class CreateModuleDto {
  @IsUUID('4', { message: 'ID do curso deve ser um UUID válido' })
  @IsNotEmpty({ message: 'ID do curso é obrigatório' })
  courseId: string;

  @IsString({ message: 'Título deve ser uma string' })
  @IsNotEmpty({ message: 'Título é obrigatório' })
  @MinLength(3, { message: 'Título deve ter no mínimo 3 caracteres' })
  @MaxLength(200, { message: 'Título deve ter no máximo 200 caracteres' })
  title: string;

  @IsOptional()
  @IsString({ message: 'Descrição deve ser uma string' })
  @MinLength(10, { message: 'Descrição deve ter no mínimo 10 caracteres' })
  description?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Ordem deve ser um número' })
  @Min(0, { message: 'Ordem deve ser no mínimo 0' })
  order?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Duração deve ser um número' })
  @Min(0, { message: 'Duração deve ser no mínimo 0' })
  duration?: number;

  @IsOptional()
  @IsBoolean({ message: 'isActive deve ser um booleano' })
  isActive?: boolean;
}
