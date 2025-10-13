import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('user_xp')
export class UserXP {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ default: 0 })
  totalXP: number;

  @Column({ default: 1 })
  level: number;

  @Column({ default: 0 })
  currentLevelXP: number;

  @Column({ default: 100 })
  nextLevelXP: number;

  @Column({ default: 0 })
  streak: number; // Dias consecutivos de atividade

  @Column({ nullable: true })
  lastActivityDate: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}







