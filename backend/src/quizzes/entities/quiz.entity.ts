import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Lesson } from '../../lessons/entities/lesson.entity';

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  ESSAY = 'essay',
}

@Entity('quizzes')
export class Quiz {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  lessonId: string;

  @ManyToOne(() => Lesson, (lesson) => lesson.quizzes)
  @JoinColumn({ name: 'lessonId' })
  lesson: Lesson;

  @Column()
  title: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ default: 70 })
  passingScore: number; // Percentual mínimo para passar

  @Column({ default: 0 })
  timeLimit: number; // em minutos (0 = sem limite)

  @Column({ default: true })
  showCorrectAnswers: boolean;

  @Column({ default: 1 })
  maxAttempts: number; // 0 = ilimitado

  @Column({ default: true })
  isActive: boolean;

  @OneToMany('Question', 'quiz')
  questions: any[];

  @OneToMany('QuizAttempt', 'quiz')
  attempts: any[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}