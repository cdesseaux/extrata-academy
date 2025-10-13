import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Lesson } from './lesson.entity';
import { Enrollment } from '../../enrollments/entities/enrollment.entity';

@Entity('lesson_progress')
export class LessonProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  lessonId: string;

  @ManyToOne(() => Lesson)
  @JoinColumn({ name: 'lessonId' })
  lesson: Lesson;

  @Column()
  enrollmentId: string;

  @ManyToOne(() => Enrollment)
  @JoinColumn({ name: 'enrollmentId' })
  enrollment: Enrollment;

  @Column({ default: false })
  completed: boolean;

  @Column({ nullable: true })
  completedAt: Date;

  @Column({ default: 0 })
  watchTime: number; // em segundos (para vídeos)

  @Column({ default: 0 })
  lastPosition: number; // última posição do vídeo em segundos

  @Column('jsonb', { nullable: true })
  metadata: {
    // Para quiz
    quizScore?: number;
    quizPassed?: boolean;
    attempts?: number;

    // Para vídeo
    totalWatchTime?: number;
    completionPercentage?: number;

    // Geral
    notes?: string;
    bookmarks?: Array<{
      position: number;
      note: string;
      createdAt: string;
    }>;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
