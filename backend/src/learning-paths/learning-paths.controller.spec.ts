import { Test, TestingModule } from '@nestjs/testing';
import { LearningPathsController } from './learning-paths.controller';
import { LearningPathsService } from './learning-paths.service';

describe('LearningPathsController', () => {
  let controller: LearningPathsController;
  let service: LearningPathsService;

  const mockLearningPath = {
    id: 'path-123',
    title: 'Full Stack Developer Path',
    slug: 'full-stack-developer',
    description: 'Complete path to become a full stack developer',
    targetRole: 'Full Stack Developer',
    level: 'intermediate',
    estimatedHours: 120,
    thumbnailUrl: 'https://example.com/thumb.jpg',
    isActive: true,
    createdBy: 'user-123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockEnrollment = {
    id: 'enrollment-123',
    userId: 'user-123',
    learningPathId: 'path-123',
    progressPercentage: 50,
    currentCourseId: 'course-123',
    status: 'in_progress',
    startedAt: new Date(),
    completedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRequest = {
    user: { id: 'user-123', email: 'test@example.com' },
  };

  const mockLearningPathsService = {
    create: jest.fn().mockResolvedValue(mockLearningPath),
    findAll: jest.fn().mockResolvedValue([mockLearningPath]),
    findOne: jest.fn().mockResolvedValue(mockLearningPath),
    update: jest.fn().mockResolvedValue(mockLearningPath),
    remove: jest.fn().mockResolvedValue(undefined),
    enroll: jest.fn().mockResolvedValue(mockEnrollment),
    getEnrollment: jest.fn().mockResolvedValue(mockEnrollment),
    updateProgress: jest.fn().mockResolvedValue(mockEnrollment),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LearningPathsController],
      providers: [
        {
          provide: LearningPathsService,
          useValue: mockLearningPathsService,
        },
      ],
    }).compile();

    controller = module.get<LearningPathsController>(LearningPathsController);
    service = module.get<LearningPathsService>(LearningPathsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a learning path', async () => {
      const createDto = {
        title: 'New Path',
        slug: 'new-path',
        description: 'Path description',
        targetRole: 'developer',
        estimatedHours: 100,
      };

      const result = await controller.create(createDto as any, mockRequest as any);

      expect(service.create).toHaveBeenCalledWith(createDto, 'user-123');
      expect(result).toEqual(mockLearningPath);
    });
  });

  describe('findAll', () => {
    it('should return all learning paths', async () => {
      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockLearningPath]);
    });
  });

  describe('findOne', () => {
    it('should return a learning path by ID', async () => {
      const result = await controller.findOne('path-123');

      expect(service.findOne).toHaveBeenCalledWith('path-123');
      expect(result).toEqual(mockLearningPath);
    });
  });

  describe('update', () => {
    it('should update a learning path', async () => {
      const updateDto = { title: 'Updated Path' };

      const result = await controller.update('path-123', updateDto as any);

      expect(service.update).toHaveBeenCalledWith('path-123', updateDto);
      expect(result).toEqual(mockLearningPath);
    });
  });

  describe('remove', () => {
    it('should remove a learning path', async () => {
      await controller.remove('path-123');

      expect(service.remove).toHaveBeenCalledWith('path-123');
    });
  });

  describe('enroll', () => {
    it('should enroll a user in a learning path', async () => {
      const result = await controller.enroll('path-123', mockRequest as any);

      expect(service.enroll).toHaveBeenCalledWith('user-123', 'path-123');
      expect(result).toEqual(mockEnrollment);
    });
  });

  describe('getEnrollment', () => {
    it('should get user enrollment for a learning path', async () => {
      const result = await controller.getEnrollment('path-123', mockRequest as any);

      expect(service.getEnrollment).toHaveBeenCalledWith('user-123', 'path-123');
      expect(result).toEqual(mockEnrollment);
    });
  });

  describe('updateProgress', () => {
    it('should update enrollment progress', async () => {
      const dto = { progressPercentage: 75 };

      const result = await controller.updateProgress('path-123', dto as any, mockRequest as any);

      expect(service.updateProgress).toHaveBeenCalledWith('user-123', 'path-123', 75);
      expect(result).toEqual(mockEnrollment);
    });
  });
});
