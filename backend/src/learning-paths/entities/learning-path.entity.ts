import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { LearningPathCourse } from './learning-path-course.entity';
import { LearningPathEnrollment } from './learning-path-enrollment.entity';

@Entity('learning_paths')
export class LearningPath {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column({ nullable: true })
  targetRole?: string; // ex: gestor, tecnico, auditor

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  estimatedHours?: number;

  @Column({ nullable: true })
  thumbnailUrl?: string;

  @Column({ default: false })
  isFeatured: boolean;

  @Column({ type: 'int', nullable: true })
  orderIndex?: number;

  @Column({ nullable: true })
  createdBy?: string;

  @OneToMany(() => LearningPathCourse, (pc) => pc.learningPath, { cascade: true })
  courses: LearningPathCourse[];

  @OneToMany(() => LearningPathEnrollment, (e) => e.learningPath)
  enrollments: LearningPathEnrollment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}



