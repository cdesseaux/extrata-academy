import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StartAttemptDto {
  @ApiProperty({ description: 'ID da matrícula do aluno' })
  @IsString()
  @IsNotEmpty()
  enrollmentId: string;
}
