import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LearningPathsService } from './learning-paths.service';
import { LearningPathsController } from './learning-paths.controller';
import { LearningPath } from './entities/learning-path.entity';
import { LearningPathCourse } from './entities/learning-path-course.entity';
import { LearningPathEnrollment } from './entities/learning-path-enrollment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LearningPath, LearningPathCourse, LearningPathEnrollment])],
  controllers: [LearningPathsController],
  providers: [LearningPathsService],
  exports: [LearningPathsService],
})
export class LearningPathsModule {}



