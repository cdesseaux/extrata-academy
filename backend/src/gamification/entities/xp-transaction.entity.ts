import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum XPTransactionType {
  LESSON_COMPLETED = 'lesson_completed',
  QUIZ_PASSED = 'quiz_passed',
  COURSE_COMPLETED = 'course_completed',
  STREAK_BONUS = 'streak_bonus',
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
  DAILY_LOGIN = 'daily_login',
  PERFECT_QUIZ = 'perfect_quiz',
  SPEED_BONUS = 'speed_bonus'
}

@Entity('xp_transactions')
export class XPTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({
    type: 'enum',
    enum: XPTransactionType,
  })
  type: XPTransactionType;

  @Column()
  amount: number;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'json', nullable: true })
  metadata: any; // Dados adicionais (courseId, lessonId, etc.)

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}







