import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { LearningPath } from './learning-path.entity';
import { Course } from '../../courses/entities/course.entity';

@Entity('learning_path_courses')
export class LearningPathCourse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  learningPathId: string;

  @ManyToOne(() => LearningPath, (lp) => lp.courses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'learningPathId' })
  learningPath: LearningPath;

  @Column()
  courseId: string;

  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @Column('int')
  orderIndex: number;

  @Column({ default: true })
  isRequired: boolean;
}



