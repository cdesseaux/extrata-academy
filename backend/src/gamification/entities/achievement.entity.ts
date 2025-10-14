import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum AchievementType {
  COURSE_COMPLETED = 'course_completed',
  STREAK_7_DAYS = 'streak_7_days',
  STREAK_30_DAYS = 'streak_30_days',
  FIRST_QUIZ = 'first_quiz',
  PERFECT_QUIZ = 'perfect_quiz',
  EARLY_BIRD = 'early_bird',
  SPEED_LEARNER = 'speed_learner',
  DEDICATED = 'dedicated',
  EXPERT = 'expert',
  MASTER = 'master'
}

@Entity('achievements')
export class Achievement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  icon: string; // Emoji ou ícone

  @Column({
    type: 'enum',
    enum: AchievementType,
  })
  type: AchievementType;

  @Column({ default: 0 })
  xpReward: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'json', nullable: true })
  criteria: any; // Critérios específicos para desbloqueio

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}









