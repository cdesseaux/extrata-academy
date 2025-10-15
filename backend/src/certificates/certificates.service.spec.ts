import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CertificatesService } from './certificates.service';
import { Certificate } from './entities/certificate.entity';
import { UsersService } from '../users/users.service';
import { CoursesService } from '../courses/courses.service';

describe('CertificatesService', () => {
  let service: CertificatesService;
  let certificateRepository: Repository<Certificate>;
  let usersService: UsersService;
  let coursesService: CoursesService;

  const mockCertificate = {
    id: 'cert-123',
    certificateNumber: 'EXT-123-ABC',
    userId: 'user-123',
    courseId: 'course-123',
    studentName: 'Test Student',
    title: 'Test Course',
    completionDate: new Date('2024-01-15'),
    certificateUrl: '/uploads/certificates/cert-123.pdf',
    validationHash: 'abc123',
    isActive: true,
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUser = {
    id: 'user-123',
    username: 'testuser',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'Student',
  };

  const mockCourse = {
    id: 'course-123',
    title: 'Test Course',
    description: 'Test Description',
    slug: 'test-course',
  };

  const mockCertificateRepository = {
    create: jest.fn((dto) => dto),
    save: jest.fn((cert) => Promise.resolve({ ...mockCertificate, ...cert })),
    find: jest.fn(() => Promise.resolve([mockCertificate])),
    findOne: jest.fn(() => Promise.resolve(mockCertificate)),
  };

  const mockUsersService = {
    findOne: jest.fn(() => Promise.resolve(mockUser)),
  };

  const mockCoursesService = {
    findOne: jest.fn(() => Promise.resolve(mockCourse)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CertificatesService,
        {
          provide: getRepositoryToken(Certificate),
          useValue: mockCertificateRepository,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: CoursesService,
          useValue: mockCoursesService,
        },
      ],
    }).compile();

    service = module.get<CertificatesService>(CertificatesService);
    certificateRepository = module.get<Repository<Certificate>>(getRepositoryToken(Certificate));
    usersService = module.get<UsersService>(UsersService);
    coursesService = module.get<CoursesService>(CoursesService);

    // Mock the private generateCertificatePDF method
    jest.spyOn(service as any, 'generateCertificatePDF').mockResolvedValue('/uploads/certificates/test.pdf');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCertificate', () => {
    it('should return existing certificate if one exists', async () => {
      mockCertificateRepository.findOne.mockResolvedValue(mockCertificate);

      const result = await service.createCertificate(
        'user-123',
        'course-123',
        new Date('2024-01-15'),
      );

      expect(certificateRepository.findOne).toHaveBeenCalledWith({
        where: { userId: 'user-123', courseId: 'course-123' },
      });
      expect(result).toEqual(mockCertificate);
      expect(certificateRepository.create).not.toHaveBeenCalled();
    });

    it('should create a new certificate if none exists', async () => {
      mockCertificateRepository.findOne.mockResolvedValueOnce(null);

      const result = await service.createCertificate(
        'user-123',
        'course-123',
        new Date('2024-01-15'),
      );

      expect(certificateRepository.findOne).toHaveBeenCalled();
      expect(usersService.findOne).toHaveBeenCalledWith('user-123');
      expect(coursesService.findOne).toHaveBeenCalledWith('course-123');
      expect(certificateRepository.create).toHaveBeenCalled();
      expect(certificateRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw error if user not found', async () => {
      mockCertificateRepository.findOne.mockResolvedValueOnce(null);
      mockUsersService.findOne.mockResolvedValueOnce(null);

      await expect(
        service.createCertificate('user-123', 'course-123', new Date()),
      ).rejects.toThrow('Usuário ou curso não encontrado');
    });

    it('should throw error if course not found', async () => {
      mockCertificateRepository.findOne.mockResolvedValueOnce(null);
      mockCoursesService.findOne.mockResolvedValueOnce(null);

      await expect(
        service.createCertificate('user-123', 'course-123', new Date()),
      ).rejects.toThrow('Usuário ou curso não encontrado');
    });

    it('should use username if user has no firstName/lastName', async () => {
      mockCertificateRepository.findOne.mockResolvedValueOnce(null);
      mockUsersService.findOne.mockResolvedValueOnce({
        ...mockUser,
        firstName: '',
        lastName: '',
      });

      await service.createCertificate('user-123', 'course-123', new Date());

      expect(certificateRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          studentName: 'testuser',
        }),
      );
    });
  });

  describe('getUserCertificates', () => {
    it('should return user certificates ordered by completion date', async () => {
      const result = await service.getUserCertificates('user-123');

      expect(certificateRepository.find).toHaveBeenCalledWith({
        where: { userId: 'user-123', isActive: true },
        relations: ['course'],
        order: { completionDate: 'DESC' },
      });
      expect(result).toEqual([mockCertificate]);
    });
  });

  describe('getCertificateById', () => {
    it('should return a certificate by ID', async () => {
      const result = await service.getCertificateById('cert-123');

      expect(certificateRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'cert-123', isActive: true },
        relations: ['user', 'course'],
      });
      expect(result).toEqual(mockCertificate);
    });
  });

  describe('validateCertificate', () => {
    it('should validate and return a certificate by certificate number', async () => {
      const result = await service.validateCertificate('EXT-123-ABC');

      expect(certificateRepository.findOne).toHaveBeenCalledWith({
        where: { certificateNumber: 'EXT-123-ABC', isActive: true },
        relations: ['user', 'course'],
      });
      expect(result).toEqual(mockCertificate);
    });

    it('should return null for invalid certificate number', async () => {
      mockCertificateRepository.findOne.mockResolvedValueOnce(null);

      const result = await service.validateCertificate('INVALID');

      expect(result).toBeNull();
    });
  });
});
