import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';

export enum LessonContentType {
  VIDEO = 'video',
  TEXT = 'text',
  PDF = 'pdf',
  QUIZ = 'quiz',
  EXTERNAL = 'external',
}

@Entity('lessons')
export class Lesson {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  moduleId: string;

  @ManyToOne('Module', 'lessons')
  @JoinColumn({ name: 'moduleId' })
  module: any;

  @Column()
  title: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ default: 0 })
  order: number;

  @Column({
    type: 'enum',
    enum: LessonContentType,
    default: LessonContentType.TEXT,
  })
  contentType: LessonContentType;

  @Column('jsonb', { nullable: true })
  content: {
    // Para VIDEO
    videoUrl?: string;
    videoProvider?: 'youtube' | 'vimeo' | 's3' | 'external';
    videoId?: string;

    // Para TEXT
    textContent?: string; // HTML/Markdown

    // Para PDF
    pdfUrl?: string;

    // Para QUIZ
    quizId?: string;

    // Para EXTERNAL
    externalUrl?: string;

    // Comum
    attachments?: Array<{
      name: string;
      url: string;
      type: string;
      size: number;
    }>;
  };

  @Column({ default: 0 })
  duration: number; // em segundos

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isFree: boolean; // Preview gratuito antes de matricular

  @OneToMany('Quiz', 'lesson')
  quizzes: any[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
