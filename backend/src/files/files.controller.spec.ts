import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { FileType } from './entities/file.entity';

describe('FilesController', () => {
  let controller: FilesController;
  let service: FilesService;

  const mockFilesService = {
    uploadFile: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    getPresignedUrl: jest.fn(),
  };

  const mockFile: Express.Multer.File = {
    fieldname: 'file',
    originalname: 'test.pdf',
    encoding: '7bit',
    mimetype: 'application/pdf',
    size: 1024 * 1024,
    buffer: Buffer.from('test content'),
    stream: null,
    destination: '',
    filename: '',
    path: '',
  };

  const mockRequest = {
    user: {
      id: 'user-123',
      email: 'test@example.com',
      username: 'testuser',
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [
        {
          provide: FilesService,
          useValue: mockFilesService,
        },
      ],
    }).compile();

    controller = module.get<FilesController>(FilesController);
    service = module.get<FilesService>(FilesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadVideo', () => {
    it('should upload video successfully', async () => {
      const mockResult = {
        id: 'file-123',
        originalName: 'test.mp4',
        filename: 'uuid.mp4',
        mimetype: 'video/mp4',
        size: mockFile.size,
        type: FileType.VIDEO,
        url: 'https://bucket.s3.amazonaws.com/videos/uuid.mp4',
        uploadedBy: 'user-123',
        isActive: true,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockFilesService.uploadFile.mockResolvedValue(mockResult);

      const videoFile = { ...mockFile, mimetype: 'video/mp4', originalname: 'test.mp4' };
      const result = await controller.uploadVideo(videoFile, mockRequest);

      expect(result).toEqual(mockResult);
      expect(mockFilesService.uploadFile).toHaveBeenCalledWith(
        videoFile,
        'user-123',
        FileType.VIDEO,
      );
    });

    it('should throw error if no file provided', async () => {
      await expect(controller.uploadVideo(null, mockRequest)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('uploadPdf', () => {
    it('should upload PDF successfully', async () => {
      const mockResult = {
        id: 'file-123',
        originalName: 'test.pdf',
        filename: 'uuid.pdf',
        mimetype: 'application/pdf',
        size: mockFile.size,
        type: FileType.PDF,
        url: 'https://bucket.s3.amazonaws.com/pdfs/uuid.pdf',
        uploadedBy: 'user-123',
        isActive: true,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockFilesService.uploadFile.mockResolvedValue(mockResult);

      const result = await controller.uploadPdf(mockFile, mockRequest);

      expect(result).toEqual(mockResult);
      expect(mockFilesService.uploadFile).toHaveBeenCalledWith(
        mockFile,
        'user-123',
        FileType.PDF,
      );
    });

    it('should throw error if no file provided', async () => {
      await expect(controller.uploadPdf(null, mockRequest)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('uploadImage', () => {
    it('should upload image successfully', async () => {
      const mockResult = {
        id: 'file-123',
        originalName: 'test.jpg',
        filename: 'uuid.jpg',
        mimetype: 'image/jpeg',
        size: mockFile.size,
        type: FileType.IMAGE,
        url: 'https://bucket.s3.amazonaws.com/images/uuid.jpg',
        uploadedBy: 'user-123',
        isActive: true,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockFilesService.uploadFile.mockResolvedValue(mockResult);

      const imageFile = { ...mockFile, mimetype: 'image/jpeg', originalname: 'test.jpg' };
      const result = await controller.uploadImage(imageFile, mockRequest);

      expect(result).toEqual(mockResult);
      expect(mockFilesService.uploadFile).toHaveBeenCalledWith(
        imageFile,
        'user-123',
        FileType.IMAGE,
      );
    });

    it('should throw error if no file provided', async () => {
      await expect(controller.uploadImage(null, mockRequest)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('uploadDocument', () => {
    it('should upload document successfully', async () => {
      const mockResult = {
        id: 'file-123',
        originalName: 'test.docx',
        filename: 'uuid.docx',
        mimetype: 'application/msword',
        size: mockFile.size,
        type: FileType.DOCUMENT,
        url: 'https://bucket.s3.amazonaws.com/documents/uuid.docx',
        uploadedBy: 'user-123',
        isActive: true,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockFilesService.uploadFile.mockResolvedValue(mockResult);

      const docFile = { ...mockFile, mimetype: 'application/msword', originalname: 'test.docx' };
      const result = await controller.uploadDocument(docFile, mockRequest);

      expect(result).toEqual(mockResult);
      expect(mockFilesService.uploadFile).toHaveBeenCalledWith(
        docFile,
        'user-123',
        FileType.DOCUMENT,
      );
    });
  });

  describe('findAll', () => {
    it('should return all files for user', async () => {
      const mockFiles = [
        {
          id: 'file-1',
          originalName: 'test1.pdf',
          type: FileType.PDF,
          uploadedBy: 'user-123',
        },
        {
          id: 'file-2',
          originalName: 'test2.pdf',
          type: FileType.PDF,
          uploadedBy: 'user-123',
        },
      ];

      mockFilesService.findAll.mockResolvedValue(mockFiles);

      const result = await controller.findAll(mockRequest);

      expect(result).toEqual(mockFiles);
      expect(mockFilesService.findAll).toHaveBeenCalledWith('user-123');
    });
  });

  describe('findOne', () => {
    it('should return file by id', async () => {
      const mockFileEntity = {
        id: 'file-123',
        originalName: 'test.pdf',
        type: FileType.PDF,
        url: 'https://bucket.s3.amazonaws.com/pdfs/test.pdf',
      };

      mockFilesService.findOne.mockResolvedValue(mockFileEntity);

      const result = await controller.findOne('file-123');

      expect(result).toEqual(mockFileEntity);
      expect(mockFilesService.findOne).toHaveBeenCalledWith('file-123');
    });
  });

  describe('getSignedUrl', () => {
    it('should return presigned URL', async () => {
      const mockPresignedUrl = 'https://bucket.s3.amazonaws.com/pdfs/test.pdf?X-Amz-Signature=...';
      mockFilesService.getPresignedUrl.mockResolvedValue(mockPresignedUrl);

      const result = await controller.getSignedUrl('file-123');

      expect(result).toEqual({
        url: mockPresignedUrl,
        expiresIn: 3600,
      });
      expect(mockFilesService.getPresignedUrl).toHaveBeenCalledWith('file-123', 3600);
    });
  });

  describe('remove', () => {
    it('should soft delete file', async () => {
      mockFilesService.remove.mockResolvedValue(undefined);

      await controller.remove('file-123');

      expect(mockFilesService.remove).toHaveBeenCalledWith('file-123');
    });
  });
});
