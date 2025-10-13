import { IsUUID, IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';

export class CompleteLessonDto {
  @IsUUID('4', { message: 'ID da matrícula deve ser um UUID válido' })
  @IsNotEmpty({ message: 'ID da matrícula é obrigatório' })
  enrollmentId: string;

  @IsOptional()
  @IsNumber({}, { message: 'Tempo de visualização deve ser um número' })
  @Min(0, { message: 'Tempo de visualização deve ser no mínimo 0' })
  watchTime?: number; // em segundos
}
