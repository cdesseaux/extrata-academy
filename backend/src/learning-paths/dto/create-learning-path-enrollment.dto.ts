import { IsUUID } from 'class-validator';

export class CreateLearningPathEnrollmentDto {
  @IsUUID()
  learningPathId: string;
}



