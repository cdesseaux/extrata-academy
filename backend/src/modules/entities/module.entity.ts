import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Course } from '../../courses/entities/course.entity';

@Entity('modules')
export class Module {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  courseId: string;

  @ManyToOne(() => Course, (course) => course.modules)
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @Column()
  title: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ default: 0 })
  order: number;

  @Column({ default: 0 })
  duration: number; // em minutos (soma das lições)

  @OneToMany('Lesson', 'module', { cascade: true })
  lessons: any[];

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
