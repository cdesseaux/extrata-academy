import { IsUUID, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class UpdateWatchTimeDto {
  @IsUUID('4', { message: 'ID da matrícula deve ser um UUID válido' })
  @IsNotEmpty({ message: 'ID da matrícula é obrigatório' })
  enrollmentId: string;

  @IsNumber({}, { message: 'Tempo de visualização deve ser um número' })
  @Min(0, { message: 'Tempo de visualização deve ser no mínimo 0' })
  watchTime: number; // em segundos

  @IsNumber({}, { message: 'Última posição deve ser um número' })
  @Min(0, { message: 'Última posição deve ser no mínimo 0' })
  lastPosition: number; // em segundos
}
