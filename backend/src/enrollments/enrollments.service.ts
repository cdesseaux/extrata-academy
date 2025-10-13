import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment } from './entities/enrollment.entity';
import { GamificationService } from '../gamification/gamification.service';
import { XPTransactionType } from '../gamification/entities/xp-transaction.entity';
import { CertificatesService } from '../certificates/certificates.service';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment)
    private enrollmentsRepository: Repository<Enrollment>,
    private gamificationService: GamificationService,
    private certificatesService: CertificatesService,
  ) {}

  async create(enrollmentData: Partial<Enrollment>): Promise<Enrollment> {
    console.log('EnrollmentsService.create - dados recebidos:', enrollmentData);
    const enrollment = this.enrollmentsRepository.create(enrollmentData);
    console.log('Enrollment criado:', enrollment);
    const saved = await this.enrollmentsRepository.save(enrollment);
    console.log('Enrollment salvo:', saved);
    
    // Adicionar XP por se matricular em um curso
    await this.gamificationService.addXP(
      enrollmentData.userId!,
      50,
      XPTransactionType.LESSON_COMPLETED,
      'Matriculado em novo curso',
      { courseId: enrollmentData.courseId },
    );
    
    return saved;
  }

  async findAll(): Promise<Enrollment[]> {
    return this.enrollmentsRepository.find({
      relations: ['user', 'course'],
    });
  }

  async findOne(id: string): Promise<Enrollment | null> {
    return this.enrollmentsRepository.findOne({
      where: { id },
      relations: ['user', 'course'],
    });
  }

  async findByUser(userId: string): Promise<Enrollment[]> {
    return this.enrollmentsRepository.find({
      where: { userId },
      relations: ['course'],
    });
  }

  async findByCourse(courseId: string): Promise<Enrollment[]> {
    return this.enrollmentsRepository.find({
      where: { courseId },
      relations: ['user'],
    });
  }

  async findUserEnrollment(userId: string, courseId: string): Promise<Enrollment | null> {
    return this.enrollmentsRepository.findOne({
      where: { userId, courseId },
      relations: ['user', 'course'],
    });
  }

  async update(id: string, enrollmentData: Partial<Enrollment>): Promise<Enrollment | null> {
    await this.enrollmentsRepository.update(id, enrollmentData);
    return this.findOne(id);
  }

  async updateProgress(id: string, progress: number): Promise<Enrollment | null> {
    const enrollment = await this.findOne(id);
    if (!enrollment) return null;

    const updateData: Partial<Enrollment> = { progress };
    
    if (progress === 100) {
      updateData.status = 'completed';
      updateData.completedAt = new Date();
      
      // Adicionar XP por completar curso
      await this.gamificationService.addXP(
        enrollment.userId,
        500,
        XPTransactionType.COURSE_COMPLETED,
        'Curso completado!',
        { courseId: enrollment.courseId },
      );

      // Gerar certificado automaticamente
      try {
        const certificate = await this.certificatesService.createCertificate(
          enrollment.userId,
          enrollment.courseId,
          new Date(),
        );
        
        // Atualizar enrollment com URL do certificado
        updateData.certificateUrl = certificate.certificateUrl;
        
        console.log(`Certificado gerado para usuário ${enrollment.userId} no curso ${enrollment.courseId}`);
      } catch (error) {
        console.error('Erro ao gerar certificado:', error);
        // Não falha o processo se o certificado não for gerado
      }
    } else if (progress > 0 && progress % 25 === 0) {
      // Adicionar XP por marcos de progresso (25%, 50%, 75%)
      const milestoneXP = progress === 25 ? 50 : progress === 50 ? 100 : 150;
      await this.gamificationService.addXP(
        enrollment.userId,
        milestoneXP,
        XPTransactionType.LESSON_COMPLETED,
        `Marco de ${progress}% atingido!`,
        { courseId: enrollment.courseId, progress },
      );
    }

    await this.enrollmentsRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.enrollmentsRepository.delete(id);
  }

  async calculateProgressFromLessons(enrollmentId: string): Promise<Enrollment | null> {
    const enrollment = await this.enrollmentsRepository.findOne({
      where: { id: enrollmentId },
      relations: ['course', 'course.modules', 'course.modules.lessons'],
    });

    if (!enrollment) {
      return null;
    }

    // Conta total de lições no curso
    const totalLessons = enrollment.course.modules.reduce(
      (sum, module) => sum + (module.lessons?.length || 0),
      0,
    );

    if (totalLessons === 0) {
      return enrollment;
    }

    // Busca progresso das lições para este enrollment
    const lessonProgressRepository = this.enrollmentsRepository.manager.getRepository('LessonProgress');
    const completedLessons = await lessonProgressRepository.count({
      where: {
        enrollmentId,
        completed: true,
      },
    });

    // Calcula percentual
    const progress = Math.round((completedLessons / totalLessons) * 100);

    // Atualiza o progresso
    return this.updateProgress(enrollmentId, progress);
  }
}

