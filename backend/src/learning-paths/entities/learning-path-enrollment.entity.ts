import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { LearningPath } from './learning-path.entity';
import { User } from '../../users/entities/user.entity';

@Entity('learning_path_enrollments')
export class LearningPathEnrollment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  learningPathId: string;

  @ManyToOne(() => LearningPath, (lp) => lp.enrollments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'learningPathId' })
  learningPath: LearningPath;

  @CreateDateColumn()
  enrolledAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  progressPercentage: number;
}



