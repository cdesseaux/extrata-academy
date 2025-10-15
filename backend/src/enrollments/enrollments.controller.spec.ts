import { Test, TestingModule } from '@nestjs/testing';
import { EnrollmentsController } from './enrollments.controller';
import { EnrollmentsService } from './enrollments.service';

describe('EnrollmentsController', () => {
  let controller: EnrollmentsController;
  let service: EnrollmentsService;

  const mockEnrollment = {
    id: 'enrollment-123',
    userId: 'user-123',
    courseId: 'course-123',
    status: 'in_progress',
    progress: 50,
    startedAt: new Date(),
    completedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRequest = {
    user: { id: 'user-123', email: 'test@example.com' },
  };

  const mockEnrollmentsService = {
    create: jest.fn().mockResolvedValue(mockEnrollment),
    findByUser: jest.fn().mockResolvedValue([mockEnrollment]),
    findOne: jest.fn().mockResolvedValue(mockEnrollment),
    updateProgress: jest.fn().mockResolvedValue(mockEnrollment),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EnrollmentsController],
      providers: [
        {
          provide: EnrollmentsService,
          useValue: mockEnrollmentsService,
        },
      ],
    }).compile();

    controller = module.get<EnrollmentsController>(EnrollmentsController);
    service = module.get<EnrollmentsService>(EnrollmentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should enroll a user in a course', async () => {
      const createDto = { courseId: 'course-123' };

      const result = await controller.create(createDto, mockRequest as any);

      expect(service.create).toHaveBeenCalledWith({
        userId: 'user-123',
        courseId: 'course-123',
      });
      expect(result).toEqual(mockEnrollment);
    });
  });

  describe('findMyEnrollments', () => {
    it('should return user enrollments', async () => {
      const result = await controller.findMyEnrollments(mockRequest as any);

      expect(service.findByUser).toHaveBeenCalledWith('user-123');
      expect(result).toEqual([mockEnrollment]);
    });
  });

  describe('findOne', () => {
    it('should return an enrollment by ID', async () => {
      const result = await controller.findOne('enrollment-123');

      expect(service.findOne).toHaveBeenCalledWith('enrollment-123');
      expect(result).toEqual(mockEnrollment);
    });
  });
});
