import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum FileType {
  VIDEO = 'video',
  PDF = 'pdf',
  IMAGE = 'image',
  DOCUMENT = 'document',
  OTHER = 'other'
}

@Entity('files')
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  originalName: string;

  @Column()
  filename: string;

  @Column()
  mimetype: string;

  @Column({ type: 'bigint' })
  size: number;

  @Column({
    type: 'enum',
    enum: FileType,
    default: FileType.OTHER
  })
  type: FileType;

  @Column()
  url: string;

  @Column({ nullable: true })
  thumbnailUrl: string;

  @Column({ nullable: true })
  uploadedBy: string; // userId

  @Column({ default: true })
  isActive: boolean;

  @Column('jsonb', { nullable: true })
  metadata: {
    width?: number;
    height?: number;
    duration?: number;
    [key: string]: any;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
