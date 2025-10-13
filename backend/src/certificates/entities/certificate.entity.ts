import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Course } from '../../courses/entities/course.entity';

@Entity('certificates')
export class Certificate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  courseId: string;

  @Column()
  certificateNumber: string; // Número único do certificado

  @Column()
  title: string; // Título do curso

  @Column()
  studentName: string; // Nome do estudante

  @Column()
  completionDate: Date; // Data de conclusão

  @Column({ nullable: true })
  certificateUrl: string; // URL do PDF gerado

  @Column({ type: 'json', nullable: true })
  metadata: any; // Dados adicionais (duração, nota, etc.)

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Course)
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}







