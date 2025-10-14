import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, ValidateNested, IsUUID, Min, Max, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class LearningPathCourseItemDto {
  @IsUUID()
  courseId: string;

  @IsInt()
  @Min(0)
  orderIndex: number;

  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;
}

export class CreateLearningPathDto {
  @IsString()
  title: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  targetRole?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(999.99)
  estimatedHours?: number;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsInt()
  orderIndex?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LearningPathCourseItemDto)
  courses?: LearningPathCourseItemDto[];
}



