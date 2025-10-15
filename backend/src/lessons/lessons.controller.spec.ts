import { Test, TestingModule } from '@nestjs/testing';
import { LessonsController } from './lessons.controller';
import { LessonsService } from './lessons.service';

describe('LessonsController', () => {
  let controller: LessonsController;
  let service: LessonsService;

  const mockLesson = {
    id: 'lesson-123',
    moduleId: 'module-123',
    title: 'Test Lesson',
    description: 'Test Description',
    content: 'Test Content',
    order: 1,
    duration: 30,
    type: 'video',
    videoUrl: 'https://example.com/video.mp4',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockProgress = {
    id: 'progress-123',
    userId: 'user-123',
    lessonId: 'lesson-123',
    enrollmentId: 'enrollment-123',
    completed: false,
    watchTime: 0,
    lastPosition: 0,
    completedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRequest = {
    user: { id: 'user-123', email: 'test@example.com' },
  };

  const mockLessonsService = {
    create: jest.fn().mockResolvedValue(mockLesson),
    findAll: jest.fn().mockResolvedValue([mockLesson]),
    findOne: jest.fn().mockResolvedValue(mockLesson),
    findByModule: jest.fn().mockResolvedValue([mockLesson]),
    update: jest.fn().mockResolvedValue(mockLesson),
    remove: jest.fn().mockResolvedValue(undefined),
    reorder: jest.fn().mockResolvedValue([mockLesson]),
    getProgress: jest.fn().mockResolvedValue(mockProgress),
    markAsCompleted: jest.fn().mockResolvedValue(mockProgress),
    updateWatchTime: jest.fn().mockResolvedValue(mockProgress),
    getEnrollmentProgress: jest.fn().mockResolvedValue([mockProgress]),
    getUserProgress: jest.fn().mockResolvedValue([mockProgress]),
    getNextLesson: jest.fn().mockResolvedValue(mockLesson),
    getPreviousLesson: jest.fn().mockResolvedValue(mockLesson),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LessonsController],
      providers: [
        {
          provide: LessonsService,
          useValue: mockLessonsService,
        },
      ],
    }).compile();

    controller = module.get<LessonsController>(LessonsController);
    service = module.get<LessonsService>(LessonsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a lesson', async () => {
      const createDto = {
        moduleId: 'module-123',
        title: 'Test Lesson',
        content: 'Test Content',
      };

      const result = await controller.create(createDto, mockRequest as any);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockLesson);
    });
  });

  describe('findAll', () => {
    it('should return all lessons', async () => {
      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockLesson]);
    });
  });

  describe('findByModule', () => {
    it('should return lessons for a specific module', async () => {
      const result = await controller.findByModule('module-123');

      expect(service.findByModule).toHaveBeenCalledWith('module-123');
      expect(result).toEqual([mockLesson]);
    });
  });

  describe('findOne', () => {
    it('should return a lesson by ID', async () => {
      const result = await controller.findOne('lesson-123');

      expect(service.findOne).toHaveBeenCalledWith('lesson-123');
      expect(result).toEqual(mockLesson);
    });
  });

  describe('update', () => {
    it('should update a lesson', async () => {
      const updateDto = { title: 'Updated Lesson' };

      const result = await controller.update('lesson-123', updateDto);

      expect(service.update).toHaveBeenCalledWith('lesson-123', updateDto);
      expect(result).toEqual(mockLesson);
    });
  });

  describe('remove', () => {
    it('should remove a lesson', async () => {
      await controller.remove('lesson-123');

      expect(service.remove).toHaveBeenCalledWith('lesson-123');
    });
  });

  describe('reorder', () => {
    it('should reorder lessons in a module', async () => {
      const body = {
        lessonOrders: [
          { id: 'lesson-1', order: 0 },
          { id: 'lesson-2', order: 1 },
        ],
      };

      const result = await controller.reorder('module-123', body);

      expect(service.reorder).toHaveBeenCalledWith('module-123', body.lessonOrders);
      expect(result).toEqual([mockLesson]);
    });
  });

  describe('getProgress', () => {
    it('should get lesson progress for a user', async () => {
      const body = { enrollmentId: 'enrollment-123' };

      const result = await controller.getProgress('lesson-123', mockRequest as any, body);

      expect(service.getProgress).toHaveBeenCalledWith('user-123', 'lesson-123', 'enrollment-123');
      expect(result).toEqual(mockProgress);
    });
  });

  describe('markAsCompleted', () => {
    it('should mark a lesson as completed', async () => {
      const body = { enrollmentId: 'enrollment-123' };

      const result = await controller.markAsCompleted('lesson-123', mockRequest as any, body);

      expect(service.markAsCompleted).toHaveBeenCalledWith('user-123', 'lesson-123', 'enrollment-123');
      expect(result).toEqual(mockProgress);
    });
  });

  describe('updateWatchTime', () => {
    it('should update lesson watch time', async () => {
      const body = {
        enrollmentId: 'enrollment-123',
        watchTime: 120,
        lastPosition: 60,
      };

      const result = await controller.updateWatchTime('lesson-123', mockRequest as any, body);

      expect(service.updateWatchTime).toHaveBeenCalledWith(
        'user-123',
        'lesson-123',
        'enrollment-123',
        120,
        60,
      );
      expect(result).toEqual(mockProgress);
    });
  });

  describe('getEnrollmentProgress', () => {
    it('should get progress for an enrollment', async () => {
      const result = await controller.getEnrollmentProgress('enrollment-123');

      expect(service.getEnrollmentProgress).toHaveBeenCalledWith('enrollment-123');
      expect(result).toEqual([mockProgress]);
    });
  });

  describe('getUserProgress', () => {
    it('should get progress for a user', async () => {
      const result = await controller.getUserProgress(mockRequest as any);

      expect(service.getUserProgress).toHaveBeenCalledWith('user-123');
      expect(result).toEqual([mockProgress]);
    });
  });

  describe('getNextLesson', () => {
    it('should get the next lesson', async () => {
      const body = { moduleId: 'module-123' };

      const result = await controller.getNextLesson('lesson-123', body);

      expect(service.getNextLesson).toHaveBeenCalledWith('module-123', 'lesson-123');
      expect(result).toEqual(mockLesson);
    });
  });

  describe('getPreviousLesson', () => {
    it('should get the previous lesson', async () => {
      const body = { moduleId: 'module-123' };

      const result = await controller.getPreviousLesson('lesson-123', body);

      expect(service.getPreviousLesson).toHaveBeenCalledWith('module-123', 'lesson-123');
      expect(result).toEqual(mockLesson);
    });
  });
});
