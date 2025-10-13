import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lesson } from './entities/lesson.entity';
import { LessonProgress } from './entities/lesson-progress.entity';
import { EnrollmentsService } from '../enrollments/enrollments.service';

@Injectable()
export class LessonsService {
  constructor(
    @InjectRepository(Lesson)
    private lessonsRepository: Repository<Lesson>,
    @InjectRepository(LessonProgress)
    private progressRepository: Repository<LessonProgress>,
    @Inject(forwardRef(() => EnrollmentsService))
    private enrollmentsService: EnrollmentsService,
  ) {}

  async create(lessonData: Partial<Lesson>): Promise<Lesson> {
    // Pega a maior ordem atual e adiciona 1
    const maxOrder = await this.lessonsRepository
      .createQueryBuilder('lesson')
      .where('lesson.moduleId = :moduleId', { moduleId: lessonData.moduleId })
      .select('MAX(lesson.order)', 'maxOrder')
      .getRawOne();

    const lesson = this.lessonsRepository.create({
      ...lessonData,
      order: maxOrder?.maxOrder !== null ? maxOrder.maxOrder + 1 : 0,
    });

    return this.lessonsRepository.save(lesson);
  }

  async findAll(): Promise<Lesson[]> {
    return this.lessonsRepository.find({
      where: { isActive: true },
      relations: ['module'],
      order: { order: 'ASC', createdAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Lesson> {
    const lesson = await this.lessonsRepository.findOne({
      where: { id, isActive: true },
      relations: ['module'],
    });

    if (!lesson) {
      throw new NotFoundException(`Lição com ID ${id} não encontrada`);
    }

    return lesson;
  }

  async findByModule(moduleId: string): Promise<Lesson[]> {
    return this.lessonsRepository.find({
      where: { moduleId, isActive: true },
      order: { order: 'ASC', createdAt: 'ASC' },
    });
  }

  async update(id: string, lessonData: Partial<Lesson>): Promise<Lesson> {
    const lesson = await this.findOne(id);

    Object.assign(lesson, lessonData);

    return this.lessonsRepository.save(lesson);
  }

  async remove(id: string): Promise<void> {
    const lesson = await this.lessonsRepository.findOne({
      where: { id },
    });

    if (!lesson) {
      throw new NotFoundException(`Lição com ID ${id} não encontrada`);
    }

    // Se já está inativa, não precisa fazer nada
    if (!lesson.isActive) {
      return;
    }

    lesson.isActive = false;
    await this.lessonsRepository.save(lesson);
  }

  async reorder(moduleId: string, lessonOrders: Array<{ id: string; order: number }>): Promise<Lesson[]> {
    // Atualiza a ordem de cada lição
    for (const { id, order } of lessonOrders) {
      await this.lessonsRepository.update({ id, moduleId }, { order });
    }

    return this.findByModule(moduleId);
  }

  // Progress tracking
  async getProgress(userId: string, lessonId: string, enrollmentId: string): Promise<LessonProgress | null> {
    return this.progressRepository.findOne({
      where: { userId, lessonId, enrollmentId },
      relations: ['lesson'],
    });
  }

  async markAsCompleted(userId: string, lessonId: string, enrollmentId: string): Promise<LessonProgress> {
    let progress = await this.getProgress(userId, lessonId, enrollmentId);

    if (!progress) {
      progress = this.progressRepository.create({
        userId,
        lessonId,
        enrollmentId,
        completed: true,
        completedAt: new Date(),
      });
    } else {
      progress.completed = true;
      progress.completedAt = new Date();
    }

    const savedProgress = await this.progressRepository.save(progress);

    // Recalcula automaticamente o progresso da matrícula
    try {
      await this.enrollmentsService.calculateProgressFromLessons(enrollmentId);
    } catch (error) {
      console.error('Erro ao recalcular progresso da matrícula:', error);
      // Não falha a operação se o recálculo falhar
    }

    return savedProgress;
  }

  async updateWatchTime(
    userId: string,
    lessonId: string,
    enrollmentId: string,
    watchTime: number,
    lastPosition: number,
  ): Promise<LessonProgress> {
    let progress = await this.getProgress(userId, lessonId, enrollmentId);

    if (!progress) {
      progress = this.progressRepository.create({
        userId,
        lessonId,
        enrollmentId,
        watchTime,
        lastPosition,
      });
    } else {
      progress.watchTime = watchTime;
      progress.lastPosition = lastPosition;
    }

    return this.progressRepository.save(progress);
  }

  async getEnrollmentProgress(enrollmentId: string): Promise<LessonProgress[]> {
    return this.progressRepository.find({
      where: { enrollmentId },
      relations: ['lesson'],
      order: { createdAt: 'ASC' },
    });
  }

  async getUserProgress(userId: string): Promise<LessonProgress[]> {
    return this.progressRepository.find({
      where: { userId },
      relations: ['lesson', 'enrollment'],
      order: { updatedAt: 'DESC' },
    });
  }

  async getNextLesson(moduleId: string, currentLessonId: string): Promise<Lesson | null> {
    const currentLesson = await this.findOne(currentLessonId);

    const nextLesson = await this.lessonsRepository
      .createQueryBuilder('lesson')
      .where('lesson.moduleId = :moduleId', { moduleId })
      .andWhere('lesson.order > :currentOrder', { currentOrder: currentLesson.order })
      .andWhere('lesson.isActive = true')
      .orderBy('lesson.order', 'ASC')
      .getOne();

    return nextLesson || null;
  }

  async getPreviousLesson(moduleId: string, currentLessonId: string): Promise<Lesson | null> {
    const currentLesson = await this.findOne(currentLessonId);

    const previousLesson = await this.lessonsRepository
      .createQueryBuilder('lesson')
      .where('lesson.moduleId = :moduleId', { moduleId })
      .andWhere('lesson.order < :currentOrder', { currentOrder: currentLesson.order })
      .andWhere('lesson.isActive = true')
      .orderBy('lesson.order', 'DESC')
      .getOne();

    return previousLesson || null;
  }
}
