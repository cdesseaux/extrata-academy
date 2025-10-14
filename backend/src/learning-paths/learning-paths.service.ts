import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LearningPath } from './entities/learning-path.entity';
import { LearningPathCourse } from './entities/learning-path-course.entity';
import { LearningPathEnrollment } from './entities/learning-path-enrollment.entity';
import { CreateLearningPathDto, LearningPathCourseItemDto } from './dto/create-learning-path.dto';
import { UpdateLearningPathDto } from './dto/update-learning-path.dto';

@Injectable()
export class LearningPathsService {
  constructor(
    @InjectRepository(LearningPath)
    private learningPathRepo: Repository<LearningPath>,
    @InjectRepository(LearningPathCourse)
    private learningPathCourseRepo: Repository<LearningPathCourse>,
    @InjectRepository(LearningPathEnrollment)
    private learningPathEnrollmentRepo: Repository<LearningPathEnrollment>,
  ) {}

  async create(dto: CreateLearningPathDto, createdBy?: string): Promise<LearningPath> {
    const learningPath = this.learningPathRepo.create({
      title: dto.title,
      slug: dto.slug,
      description: dto.description,
      targetRole: dto.targetRole,
      estimatedHours: dto.estimatedHours,
      thumbnailUrl: dto.thumbnailUrl,
      isFeatured: dto.isFeatured ?? false,
      orderIndex: dto.orderIndex,
      createdBy,
    });

    const saved = await this.learningPathRepo.save(learningPath);

    if (dto.courses?.length) {
      await this.setCourses(saved.id, dto.courses);
    }

    return this.findOne(saved.id);
  }

  findAll(): Promise<LearningPath[]> {
    return this.learningPathRepo.find({ relations: ['courses', 'courses.course'] });
  }

  async findOne(id: string): Promise<LearningPath> {
    const lp = await this.learningPathRepo.findOne({ where: { id }, relations: ['courses', 'courses.course'] });
    if (!lp) throw new NotFoundException('Learning path not found');
    return lp;
  }

  async update(id: string, dto: UpdateLearningPathDto): Promise<LearningPath> {
    const existing = await this.findOne(id);
    Object.assign(existing, dto);
    await this.learningPathRepo.save(existing);

    if (dto.courses) {
      await this.setCourses(id, dto.courses as LearningPathCourseItemDto[]);
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.learningPathRepo.delete(id);
  }

  async setCourses(learningPathId: string, items: LearningPathCourseItemDto[]): Promise<void> {
    await this.learningPathCourseRepo.delete({ learningPathId });
    const rows = items.map((it) =>
      this.learningPathCourseRepo.create({
        learningPathId,
        courseId: it.courseId,
        orderIndex: it.orderIndex,
        isRequired: it.isRequired ?? true,
      }),
    );
    await this.learningPathCourseRepo.save(rows);
  }

  // Enrollments
  async enroll(userId: string, learningPathId: string): Promise<LearningPathEnrollment> {
    const exists = await this.learningPathEnrollmentRepo.findOne({ where: { userId, learningPathId } });
    if (exists) return exists;
    const lp = await this.findOne(learningPathId);
    const enrollment = this.learningPathEnrollmentRepo.create({ userId, learningPathId: lp.id, progressPercentage: 0 });
    return this.learningPathEnrollmentRepo.save(enrollment);
  }

  async getEnrollment(userId: string, learningPathId: string): Promise<LearningPathEnrollment | null> {
    return this.learningPathEnrollmentRepo.findOne({ where: { userId, learningPathId } });
  }

  async updateProgress(userId: string, learningPathId: string, progressPercentage: number): Promise<LearningPathEnrollment> {
    const enrollment = await this.learningPathEnrollmentRepo.findOne({ where: { userId, learningPathId } });
    if (!enrollment) throw new NotFoundException('Enrollment not found');
    enrollment.progressPercentage = progressPercentage;
    if (progressPercentage >= 100 && !enrollment.completedAt) {
      enrollment.completedAt = new Date();
    }
    return this.learningPathEnrollmentRepo.save(enrollment);
  }
}


