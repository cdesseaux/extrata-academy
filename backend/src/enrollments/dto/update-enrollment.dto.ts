import { IsOptional, IsString, IsIn, IsNumber, Min, Max } from 'class-validator';

export class UpdateEnrollmentDto {
  @IsOptional()
  @IsString({ message: 'Status deve ser uma string' })
  @IsIn(['enrolled', 'completed', 'dropped'], { message: 'Status inválido' })
  status?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Progresso deve ser um número' })
  @Min(0, { message: 'Progresso deve ser no mínimo 0' })
  @Max(100, { message: 'Progresso deve ser no máximo 100' })
  progress?: number;
}
