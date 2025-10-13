import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsUUID, IsEnum, IsObject, Min, MinLength, MaxLength } from 'class-validator';
import { LessonContentType } from '../entities/lesson.entity';

export class CreateLessonDto {
  @IsUUID('4', { message: 'ID do módulo deve ser um UUID válido' })
  @IsNotEmpty({ message: 'ID do módulo é obrigatório' })
  moduleId: string;

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

  @IsEnum(LessonContentType, { message: 'Tipo de conteúdo inválido' })
  contentType: LessonContentType;

  @IsOptional()
  @IsObject({ message: 'Conteúdo deve ser um objeto' })
  content?: {
    // Para VIDEO
    videoUrl?: string;
    videoProvider?: 'youtube' | 'vimeo' | 's3' | 'external';
    videoId?: string;

    // Para TEXT
    textContent?: string;

    // Para PDF
    pdfUrl?: string;

    // Para QUIZ
    quizId?: string;

    // Para EXTERNAL
    externalUrl?: string;

    // Comum
    attachments?: Array<{
      name: string;
      url: string;
      type: string;
      size: number;
    }>;
  };

  @IsOptional()
  @IsNumber({}, { message: 'Duração deve ser um número' })
  @Min(0, { message: 'Duração deve ser no mínimo 0' })
  duration?: number;

  @IsOptional()
  @IsBoolean({ message: 'isActive deve ser um booleano' })
  isActive?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'isFree deve ser um booleano' })
  isFree?: boolean;
}
