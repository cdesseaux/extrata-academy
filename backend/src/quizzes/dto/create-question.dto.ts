import { IsString, IsOptional, IsNumber, IsArray, ValidateNested, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionType } from '../entities/quiz.entity';

export class QuestionOptionDto {
  @IsString()
  id: string;

  @IsString()
  text: string;
}

export class CreateQuestionDto {
  @IsString()
  quizId: string;

  @IsString()
  question: string;

  @IsEnum(QuestionType)
  type: QuestionType;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionOptionDto)
  options: QuestionOptionDto[];

  @IsArray()
  @IsString({ each: true })
  correctAnswers: string[];

  @IsOptional()
  @IsNumber()
  @Min(1)
  points?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;

  @IsOptional()
  @IsString()
  explanation?: string;
}