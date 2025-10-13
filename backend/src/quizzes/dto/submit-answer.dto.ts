import { IsString, IsNotEmpty, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitAnswerDto {
  @ApiProperty({ description: 'ID da questão' })
  @IsString()
  @IsNotEmpty()
  questionId: string;

  @ApiProperty({ description: 'IDs das opções selecionadas', example: ['a'] })
  @IsArray()
  @IsString({ each: true })
  answer: string[];
}
