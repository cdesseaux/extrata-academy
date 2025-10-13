import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, IsBoolean, IsUrl, Min, Max, MinLength, MaxLength } from 'class-validator';

export class CreateCourseDto {
  @IsString({ message: 'Título deve ser uma string' })
  @IsNotEmpty({ message: 'Título é obrigatório' })
  @MinLength(5, { message: 'Título deve ter no mínimo 5 caracteres' })
  @MaxLength(200, { message: 'Título deve ter no máximo 200 caracteres' })
  title: string;

  @IsString({ message: 'Descrição deve ser uma string' })
  @IsNotEmpty({ message: 'Descrição é obrigatória' })
  @MinLength(10, { message: 'Descrição deve ter no mínimo 10 caracteres' })
  description: string;

  @IsOptional()
  @IsUrl({}, { message: 'URL da thumbnail inválida' })
  thumbnailUrl?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Duração deve ser um número' })
  @Min(0, { message: 'Duração deve ser no mínimo 0' })
  duration?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Dificuldade deve ser um número' })
  @Min(1, { message: 'Dificuldade deve ser no mínimo 1' })
  @Max(5, { message: 'Dificuldade deve ser no máximo 5' })
  difficulty?: number;

  @IsOptional()
  @IsArray({ message: 'Tags deve ser um array' })
  @IsString({ each: true, message: 'Cada tag deve ser uma string' })
  tags?: string[];

  @IsOptional()
  @IsBoolean({ message: 'isActive deve ser um booleano' })
  isActive?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'isPublished deve ser um booleano' })
  isPublished?: boolean;

  @IsOptional()
  @IsString({ message: 'ID do instrutor deve ser uma string' })
  instructorId?: string;
}
