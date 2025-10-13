import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Module } from '../../modules/entities/module.entity';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({ nullable: true })
  thumbnailUrl: string;

  @Column({ default: 0 })
  duration: number; // em minutos

  @Column({ default: 0 })
  difficulty: number; // 1-5

  @Column('text', { array: true, default: [] })
  tags: string[];

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isPublished: boolean;

  @Column({ nullable: true })
  instructorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'instructorId' })
  instructor: User;

  @OneToMany(() => Module, module => module.course, { cascade: true })
  modules: Module[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}








