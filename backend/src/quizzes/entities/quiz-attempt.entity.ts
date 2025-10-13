import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Quiz } from './quiz.entity';

@Entity('quiz_attempts')
export class QuizAttempt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  quizId: string;

  @Column()
  userId: string;

  @Column()
  enrollmentId: string;

  @ManyToOne(() => Quiz, (quiz) => quiz.attempts)
  @JoinColumn({ name: 'quizId' })
  quiz: Quiz;

  @Column('jsonb')
  answers: Array<{ questionId: string; answer: string[] }>;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  score: number;

  @Column({ default: false })
  passed: boolean;

  @Column({ nullable: true })
  startedAt: Date;

  @Column({ nullable: true })
  completedAt: Date;

  @Column({ default: 1 })
  attemptNumber: number;

  @Column('jsonb', { nullable: true })
  feedback: Array<{
    questionId: string;
    isCorrect: boolean;
    userAnswer: string[];
    correctAnswer: string[];
    explanation?: string;
  }>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}