import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { FilesService } from './files.service';
import { File, FileType } from './entities/file.entity';
import { Repository } from 'typeorm';

describe('FilesService', () => {
  let service: FilesService;
  let repository: Repository<File>;
  let configService: ConfigService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: any) => {
      const config = {
        STORAGE_TYPE: 's3',
        STORAGE_PATH: './storage',
        S3_BUCKET: 'test-bucket',
        AWS_REGION: 'us-east-1',
        AWS_ACCESS_KEY_ID: 'test-access-key',
        AWS_SECRET_ACCESS_KEY: 'test-secret-key',
      };
      return config[key] || defaultValue;
    }),
  };

  const mockFile: Express.Multer.File = {
    fieldname: 'file',
    originalname: 'test.pdf',
    encoding: '7bit',
    mimetype: 'application/pdf',
    size: 1024 * 1024, // 1MB
    buffer: Buffer.from('test file content'),
    stream: null,
    destination: '',
    filename: '',
    path: '',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        {
          provide: getRepositoryToken(File),
          useValue: mockRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<FilesService>(FilesService);
    repository = module.get<Repository<File>>(getRepositoryToken(File));
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('detectFileType', () => {
    it('should detect video type', () => {
      const result = service['detectFileType']('video/mp4');
      expect(result).toBe(FileType.VIDEO);
    });

    it('should detect PDF type', () => {
      const result = service['detectFileType']('application/pdf');
      expect(result).toBe(FileType.PDF);
    });

    it('should detect image type', () => {
      const result = service['detectFileType']('image/jpeg');
      expect(result).toBe(FileType.IMAGE);
    });

    it('should detect document type', () => {
      const result = service['detectFileType']('application/msword');
      expect(result).toBe(FileType.DOCUMENT);
    });

    it('should return OTHER for unknown types', () => {
      const result = service['detectFileType']('application/unknown');
      expect(result).toBe(FileType.OTHER);
    });
  });

  describe('validateFile', () => {
    it('should throw error if file is too large', () => {
      const largeFile = { ...mockFile, size: 600 * 1024 * 1024 }; // 600MB
      expect(() => service['validateFile'](largeFile, FileType.VIDEO)).toThrow(
        BadRequestException,
      );
    });

    it('should throw error for invalid mimetype', () => {
      const invalidFile = { ...mockFile, mimetype: 'application/exe' };
      expect(() => service['validateFile'](invalidFile, FileType.PDF)).toThrow(
        BadRequestException,
      );
    });

    it('should pass validation for valid file', () => {
      expect(() => service['validateFile'](mockFile, FileType.PDF)).not.toThrow();
    });
  });

  describe('uploadFile', () => {
    it('should upload file to S3 successfully', async () => {
      const userId = 'user-123';
      const mockFileEntity = {
        id: 'file-123',
        originalName: 'test.pdf',
        filename: 'uuid.pdf',
        mimetype: 'application/pdf',
        size: mockFile.size,
        type: FileType.PDF,
        url: 'https://test-bucket.s3.amazonaws.com/pdfs/uuid.pdf',
        uploadedBy: userId,
        metadata: {},
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockReturnValue(mockFileEntity);
      mockRepository.save.mockResolvedValue(mockFileEntity);

      // Mock S3 upload
      jest.spyOn(service as any, 'uploadToS3').mockResolvedValue(mockFileEntity.url);

      const result = await service.uploadFile(mockFile, userId, FileType.PDF);

      expect(result).toBeDefined();
      expect(result.originalName).toBe('test.pdf');
      expect(result.type).toBe(FileType.PDF);
      expect(result.url).toContain('s3.amazonaws.com');
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should detect file type automatically if not provided', async () => {
      const userId = 'user-123';
      mockRepository.create.mockReturnValue({});
      mockRepository.save.mockResolvedValue({});
      jest.spyOn(service as any, 'uploadToS3').mockResolvedValue('https://test.com/file.pdf');

      await service.uploadFile(mockFile, userId);

      expect(service['detectFileType']).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return all active files', async () => {
      const mockFiles = [
        { id: '1', originalName: 'file1.pdf', isActive: true },
        { id: '2', originalName: 'file2.pdf', isActive: true },
      ];
      mockRepository.find.mockResolvedValue(mockFiles);

      const result = await service.findAll();

      expect(result).toEqual(mockFiles);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { isActive: true },
        order: { createdAt: 'DESC' },
      });
    });

    it('should filter files by userId if provided', async () => {
      const userId = 'user-123';
      mockRepository.find.mockResolvedValue([]);

      await service.findAll(userId);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { isActive: true, uploadedBy: userId },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    it('should return file by id', async () => {
      const mockFileEntity = {
        id: 'file-123',
        originalName: 'test.pdf',
        isActive: true,
      };
      mockRepository.findOne.mockResolvedValue(mockFileEntity);

      const result = await service.findOne('file-123');

      expect(result).toEqual(mockFileEntity);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'file-123', isActive: true },
      });
    });

    it('should return null if file not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('should soft delete file', async () => {
      const mockFileEntity = {
        id: 'file-123',
        isActive: true,
      };
      mockRepository.findOne.mockResolvedValue(mockFileEntity);
      mockRepository.save.mockResolvedValue({ ...mockFileEntity, isActive: false });

      await service.remove('file-123');

      expect(mockRepository.save).toHaveBeenCalledWith({
        ...mockFileEntity,
        isActive: false,
      });
    });

    it('should do nothing if file not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await service.remove('non-existent');

      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('getPresignedUrl', () => {
    it('should throw NotFoundException if file not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.getPresignedUrl('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return local URL if storage type is not S3', async () => {
      // Override config to use local storage
      jest.spyOn(configService, 'get').mockImplementation((key: string) => {
        if (key === 'STORAGE_TYPE') return 'local';
        return 'default';
      });

      // Recreate service with local storage
      const localService = new FilesService(repository, configService);

      const mockFileEntity = {
        id: 'file-123',
        url: 'http://localhost:4000/uploads/test.pdf',
        isActive: true,
        type: FileType.PDF,
        filename: 'test.pdf',
      };
      mockRepository.findOne.mockResolvedValue(mockFileEntity);

      const result = await localService.getPresignedUrl('file-123');

      expect(result).toBe(mockFileEntity.url);
    });

    it('should generate presigned URL for S3 files', async () => {
      const mockFileEntity = {
        id: 'file-123',
        filename: 'uuid.pdf',
        type: FileType.PDF,
        url: 'https://test-bucket.s3.amazonaws.com/pdfs/uuid.pdf',
        isActive: true,
      };
      mockRepository.findOne.mockResolvedValue(mockFileEntity);

      // Mock getSignedUrl
      const mockPresignedUrl = 'https://test-bucket.s3.amazonaws.com/pdfs/uuid.pdf?X-Amz-Signature=...';
      jest.spyOn(service as any, 'getPresignedUrl').mockResolvedValue(mockPresignedUrl);

      const result = await service.getPresignedUrl('file-123', 3600);

      expect(result).toContain('test-bucket.s3.amazonaws.com');
    });
  });
});
