import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Quiz, QuestionType } from './quiz.entity';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  quizId: string;

  @ManyToOne(() => Quiz, (quiz) => quiz.questions)
  @JoinColumn({ name: 'quizId' })
  quiz: Quiz;

  @Column('text')
  question: string;

  @Column({
    type: 'enum',
    enum: QuestionType,
    default: QuestionType.MULTIPLE_CHOICE,
  })
  type: QuestionType;

  @Column('jsonb')
  options: Array<{ id: string; text: string }>;

  @Column('simple-array')
  correctAnswers: string[]; // IDs das opções corretas

  @Column({ default: 1 })
  points: number;

  @Column({ default: 0 })
  order: number;

  @Column('text', { nullable: true })
  explanation: string; // Explicação da resposta correta

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}