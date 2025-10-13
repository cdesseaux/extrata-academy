import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { File, FileType } from './entities/file.entity';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FilesService {
  private s3Client: S3Client;
  private storageType: string;
  private storagePath: string;
  private s3Bucket: string = '';

  constructor(
    @InjectRepository(File)
    private filesRepository: Repository<File>,
    private configService: ConfigService,
  ) {
    this.storageType = this.configService.get<string>('STORAGE_TYPE', 'local');
    this.storagePath = this.configService.get<string>('STORAGE_PATH', './storage');
    this.s3Bucket = this.configService.get<string>('S3_BUCKET', '');

    // Configurar S3 se necessário
    if (this.storageType === 's3') {
      this.s3Client = new S3Client({
        region: this.configService.get<string>('AWS_REGION', 'us-east-1'),
        credentials: {
          accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID', ''),
          secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY', ''),
        },
      });
    }

    // Criar diretório de storage local se não existir
    if (this.storageType === 'local' && !fs.existsSync(this.storagePath)) {
      fs.mkdirSync(this.storagePath, { recursive: true });
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    userId: string,
    type?: FileType,
  ): Promise<File> {
    // Validar tipo de arquivo
    const fileType = type || this.detectFileType(file.mimetype);
    this.validateFile(file, fileType);

    // Gerar nome único
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    const relativePath = `${fileType}s/${filename}`;

    let url: string;

    if (this.storageType === 's3') {
      url = await this.uploadToS3(file, relativePath);
    } else {
      url = await this.uploadToLocal(file, relativePath);
    }

    // Salvar informações no banco
    const fileEntity = this.filesRepository.create({
      originalName: file.originalname,
      filename,
      mimetype: file.mimetype,
      size: file.size,
      type: fileType,
      url,
      uploadedBy: userId,
      metadata: {},
    });

    return this.filesRepository.save(fileEntity);
  }

  private async uploadToS3(file: Express.Multer.File, relativePath: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.s3Bucket,
      Key: relativePath,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
    });

    await this.s3Client.send(command);

    return `https://${this.s3Bucket}.s3.amazonaws.com/${relativePath}`;
  }

  private async uploadToLocal(file: Express.Multer.File, relativePath: string): Promise<string> {
    const fullPath = path.join(this.storagePath, relativePath);
    const dir = path.dirname(fullPath);

    // Criar diretório se não existir
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Salvar arquivo
    fs.writeFileSync(fullPath, file.buffer);

    // Retornar URL relativa
    const baseUrl = this.configService.get<string>('BACKEND_URL', 'http://localhost:4000');
    return `${baseUrl}/uploads/${relativePath}`;
  }

  private detectFileType(mimetype: string): FileType {
    if (mimetype.startsWith('video/')) return FileType.VIDEO;
    if (mimetype === 'application/pdf') return FileType.PDF;
    if (mimetype.startsWith('image/')) return FileType.IMAGE;
    if (mimetype.includes('document') || mimetype.includes('word') || mimetype.includes('excel')) {
      return FileType.DOCUMENT;
    }
    return FileType.OTHER;
  }

  private validateFile(file: Express.Multer.File, type: FileType): void {
    const maxSizes = {
      [FileType.VIDEO]: 500 * 1024 * 1024, // 500MB
      [FileType.PDF]: 50 * 1024 * 1024, // 50MB
      [FileType.IMAGE]: 10 * 1024 * 1024, // 10MB
      [FileType.DOCUMENT]: 50 * 1024 * 1024, // 50MB
      [FileType.OTHER]: 10 * 1024 * 1024, // 10MB
    };

    const maxSize = maxSizes[type];
    if (file.size > maxSize) {
      throw new BadRequestException(
        `Arquivo muito grande. Tamanho máximo para ${type}: ${maxSize / 1024 / 1024}MB`
      );
    }

    // Validar mimetypes permitidos
    const allowedMimetypes: Record<string, string[]> = {
      [FileType.VIDEO]: ['video/mp4', 'video/webm', 'video/ogg'],
      [FileType.PDF]: ['application/pdf'],
      [FileType.IMAGE]: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      [FileType.DOCUMENT]: ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    };

    const typeKey = type as string;
    if (allowedMimetypes[typeKey] && !allowedMimetypes[typeKey].includes(file.mimetype)) {
      throw new BadRequestException(`Tipo de arquivo não permitido para ${type}`);
    }
  }

  async findAll(userId?: string): Promise<File[]> {
    const where: any = { isActive: true };
    if (userId) {
      where.uploadedBy = userId;
    }
    return this.filesRepository.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<File | null> {
    return this.filesRepository.findOne({ where: { id, isActive: true } });
  }

  async remove(id: string): Promise<void> {
    const file = await this.findOne(id);
    if (file) {
      file.isActive = false;
      await this.filesRepository.save(file);
    }
  }
}
