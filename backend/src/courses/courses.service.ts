import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private coursesRepository: Repository<Course>,
  ) {}

  async create(courseData: Partial<Course>): Promise<Course> {
    const course = this.coursesRepository.create(courseData);
    return this.coursesRepository.save(course);
  }

  async findAll(): Promise<Course[]> {
    return this.coursesRepository.find({
      relations: ['instructor', 'modules', 'modules.lessons'],
      where: { isActive: true },
      order: {
        modules: {
          order: 'ASC',
          lessons: {
            order: 'ASC',
          },
        },
      },
    });
  }

  async findOne(id: string): Promise<Course | null> {
    return this.coursesRepository.findOne({
      where: { id },
      relations: ['instructor', 'modules', 'modules.lessons'],
      order: {
        modules: {
          order: 'ASC',
          lessons: {
            order: 'ASC',
          },
        },
      },
    });
  }

  async findByInstructor(instructorId: string): Promise<Course[]> {
    return this.coursesRepository.find({
      where: { instructorId, isActive: true },
      relations: ['instructor', 'modules', 'modules.lessons'],
      order: {
        modules: {
          order: 'ASC',
          lessons: {
            order: 'ASC',
          },
        },
      },
    });
  }

  async update(id: string, courseData: Partial<Course>): Promise<Course | null> {
    await this.coursesRepository.update(id, courseData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.coursesRepository.update(id, { isActive: false });
  }

  async publish(id: string): Promise<Course | null> {
    await this.coursesRepository.update(id, { isPublished: true });
    return this.findOne(id);
  }

  async unpublish(id: string): Promise<Course | null> {
    await this.coursesRepository.update(id, { isPublished: false });
    return this.findOne(id);
  }

  async updateCourseDuration(id: string): Promise<Course | null> {
    const course = await this.coursesRepository.findOne({
      where: { id },
      relations: ['modules'],
    });

    if (!course) {
      return null;
    }

    // Soma a duração de todos os módulos
    const totalDuration = course.modules.reduce(
      (sum, module) => sum + (module.duration || 0),
      0,
    );

    await this.coursesRepository.update(id, { duration: totalDuration });
    return this.findOne(id);
  }
}








