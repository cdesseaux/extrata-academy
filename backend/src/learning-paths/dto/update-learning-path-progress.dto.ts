import { IsNumber, Min, Max } from 'class-validator';

export class UpdateLearningPathProgressDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  progressPercentage: number;
}



