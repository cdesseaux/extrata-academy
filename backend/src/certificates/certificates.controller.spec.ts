import { Test, TestingModule } from '@nestjs/testing';
import { CertificatesController } from './certificates.controller';
import { CertificatesService } from './certificates.service';

describe('CertificatesController', () => {
  let controller: CertificatesController;
  let service: CertificatesService;

  const mockCertificate = {
    id: 'cert-123',
    certificateNumber: 'CERT-2024-001',
    userId: 'user-123',
    courseId: 'course-123',
    studentName: 'Test Student',
    title: 'Test Course',
    completionDate: new Date('2024-01-15'),
    certificateUrl: 'uploads/certificates/cert-123.pdf',
    validationHash: 'abc123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRequest = {
    user: { id: 'user-123', email: 'test@example.com' },
  };

  const mockCertificatesService = {
    getUserCertificates: jest.fn().mockResolvedValue([mockCertificate]),
    getCertificateById: jest.fn().mockResolvedValue(mockCertificate),
    validateCertificate: jest.fn().mockResolvedValue(mockCertificate),
    createCertificate: jest.fn().mockResolvedValue(mockCertificate),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CertificatesController],
      providers: [
        {
          provide: CertificatesService,
          useValue: mockCertificatesService,
        },
      ],
    }).compile();

    controller = module.get<CertificatesController>(CertificatesController);
    service = module.get<CertificatesService>(CertificatesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMyCertificates', () => {
    it('should return user certificates', async () => {
      const result = await controller.getMyCertificates(mockRequest as any);

      expect(service.getUserCertificates).toHaveBeenCalledWith('user-123');
      expect(result).toEqual([mockCertificate]);
    });
  });

  describe('getCertificate', () => {
    it('should return a certificate by ID', async () => {
      const result = await controller.getCertificate('cert-123');

      expect(service.getCertificateById).toHaveBeenCalledWith('cert-123');
      expect(result).toEqual(mockCertificate);
    });
  });

  describe('validateCertificate', () => {
    it('should validate a certificate and return certificate data', async () => {
      const result = await controller.validateCertificate('CERT-2024-001');

      expect(service.validateCertificate).toHaveBeenCalledWith('CERT-2024-001');
      expect(result).toEqual({
        valid: true,
        certificate: {
          id: mockCertificate.id,
          certificateNumber: mockCertificate.certificateNumber,
          studentName: mockCertificate.studentName,
          courseTitle: mockCertificate.title,
          completionDate: mockCertificate.completionDate,
          issuedAt: mockCertificate.createdAt,
        },
      });
    });

    it('should return invalid when certificate not found', async () => {
      mockCertificatesService.validateCertificate.mockResolvedValueOnce(null);

      const result = await controller.validateCertificate('INVALID-CERT');

      expect(service.validateCertificate).toHaveBeenCalledWith('INVALID-CERT');
      expect(result).toEqual({
        valid: false,
        message: 'Certificado não encontrado ou inválido',
      });
    });
  });

  describe('generateCertificate', () => {
    it('should generate a certificate with provided completion date', async () => {
      const body = {
        courseId: 'course-123',
        completionDate: '2024-01-15',
      };

      const result = await controller.generateCertificate(mockRequest as any, body);

      expect(service.createCertificate).toHaveBeenCalledWith(
        'user-123',
        'course-123',
        new Date('2024-01-15'),
      );
      expect(result).toEqual(mockCertificate);
    });

    it('should generate a certificate with current date when no completion date provided', async () => {
      const body = {
        courseId: 'course-123',
      };

      const result = await controller.generateCertificate(mockRequest as any, body);

      expect(service.createCertificate).toHaveBeenCalled();
      const callArgs = mockCertificatesService.createCertificate.mock.calls[0];
      expect(callArgs[0]).toBe('user-123');
      expect(callArgs[1]).toBe('course-123');
      expect(callArgs[2]).toBeInstanceOf(Date);
      expect(result).toEqual(mockCertificate);
    });
  });
});
