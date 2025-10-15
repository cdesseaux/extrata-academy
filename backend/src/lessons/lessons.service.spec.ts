import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LessonsService } from './lessons.service';
import { Lesson, LessonContentType } from './entities/lesson.entity';
import { LessonProgress } from './entities/lesson-progress.entity';
import { EnrollmentsService } from '../enrollments/enrollments.service';

describe('LessonsService', () => {
  let service: LessonsService;
  let lessonRepository: Repository<Lesson>;
  let progressRepository: Repository<LessonProgress>;

  const mockLesson = {
    id: 'lesson-123',
    moduleId: 'module-123',
    title: 'Test Lesson',
    description: 'Test Description',
    order: 0,
    contentType: LessonContentType.VIDEO,
    content: { videoUrl: 'https://example.com/video.mp4' },
    duration: 300,
    isActive: true,
    isFree: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockLessonRepository = {
    create: jest.fn((dto) => dto),
    save: jest.fn((lesson) => Promise.resolve({ ...mockLesson, ...lesson })),
    find: jest.fn(() => Promise.resolve([mockLesson])),
    findOne: jest.fn(() => Promise.resolve(mockLesson)),
    update: jest.fn(() => Promise.resolve({ affected: 1 })),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({ maxOrder: 0 }),
    })),
  };

  const mockProgressRepository = {
    create: jest.fn((dto) => dto),
    save: jest.fn((progress) => Promise.resolve(progress)),
    findOne: jest.fn(() => Promise.resolve(null)),
    find: jest.fn(() => Promise.resolve([])),
  };

  const mockEnrollmentsService = {
    updateProgress: jest.fn().mockResolvedValue(undefined),
    findOne: jest.fn().mockResolvedValue({ id: 'enrollment-123', progress: 50 }),
    calculateProgressFromLessons: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LessonsService,
        {
          provide: getRepositoryToken(Lesson),
          useValue: mockLessonRepository,
        },
        {
          provide: getRepositoryToken(LessonProgress),
          useValue: mockProgressRepository,
        },
        {
          provide: EnrollmentsService,
          useValue: mockEnrollmentsService,
        },
      ],
    }).compile();

    service = module.get<LessonsService>(LessonsService);
    lessonRepository = module.get<Repository<Lesson>>(getRepositoryToken(Lesson));
    progressRepository = module.get<Repository<LessonProgress>>(getRepositoryToken(LessonProgress));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a lesson', async () => {
    const lessonData = {
      moduleId: 'module-123',
      title: 'New Lesson',
      contentType: LessonContentType.TEXT,
      content: { textContent: 'Lesson content' },
    };

    const result = await service.create(lessonData);

    expect(lessonRepository.create).toHaveBeenCalledWith({
      ...lessonData,
      order: 1, // Service adds order based on maxOrder + 1
    });
    expect(lessonRepository.save).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it('should find lessons by module', async () => {
    const result = await service.findByModule('module-123');

    expect(lessonRepository.find).toHaveBeenCalled();
    expect(result).toEqual([mockLesson]);
  });

  it('should mark lesson as completed', async () => {
    const userId = 'user-123';
    const enrollmentId = 'enrollment-123';

    await service.markAsCompleted(userId, 'lesson-123', enrollmentId);

    expect(progressRepository.findOne).toHaveBeenCalled();
    expect(progressRepository.save).toHaveBeenCalled();
  });

  describe('findAll', () => {
    it('should return all active lessons', async () => {
      const result = await service.findAll();

      expect(lessonRepository.find).toHaveBeenCalledWith({
        where: { isActive: true },
        relations: ['module'],
        order: { order: 'ASC', createdAt: 'ASC' },
      });
      expect(result).toEqual([mockLesson]);
    });
  });

  describe('findOne', () => {
    it('should return a lesson by ID', async () => {
      const result = await service.findOne('lesson-123');

      expect(lessonRepository.findOne).toHaveBeenCalled();
      expect(result).toEqual(mockLesson);
    });

    it('should throw NotFoundException if lesson not found', async () => {
      mockLessonRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(
        'Lição com ID invalid-id não encontrada',
      );
    });
  });

  describe('update', () => {
    it('should update a lesson', async () => {
      const updateData = { title: 'Updated Lesson' };

      const result = await service.update('lesson-123', updateData);

      expect(lessonRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('remove', () => {
    it('should soft delete a lesson', async () => {
      await service.remove('lesson-123');

      expect(lessonRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if lesson not found', async () => {
      mockLessonRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.remove('invalid-id')).rejects.toThrow(
        'Lição com ID invalid-id não encontrada',
      );
    });

    it('should not update if lesson already inactive', async () => {
      mockLessonRepository.findOne.mockResolvedValueOnce({
        ...mockLesson,
        isActive: false,
      });

      await service.remove('lesson-123');

      expect(lessonRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('reorder', () => {
    it('should reorder lessons in a module', async () => {
      const lessonOrders = [
        { id: 'lesson-1', order: 0 },
        { id: 'lesson-2', order: 1 },
      ];

      const result = await service.reorder('module-123', lessonOrders);

      expect(lessonRepository.update).toHaveBeenCalledTimes(2);
      expect(lessonRepository.find).toHaveBeenCalled();
      expect(result).toEqual([mockLesson]);
    });
  });

  describe('getProgress', () => {
    it('should get lesson progress', async () => {
      const mockProgress = {
        id: 'progress-123',
        userId: 'user-123',
        lessonId: 'lesson-123',
        enrollmentId: 'enrollment-123',
        completed: false,
        watchTime: 0,
      };
      mockProgressRepository.findOne.mockResolvedValueOnce(mockProgress);

      const result = await service.getProgress('user-123', 'lesson-123', 'enrollment-123');

      expect(progressRepository.findOne).toHaveBeenCalledWith({
        where: { userId: 'user-123', lessonId: 'lesson-123', enrollmentId: 'enrollment-123' },
        relations: ['lesson'],
      });
      expect(result).toEqual(mockProgress);
    });
  });

  describe('markAsCompleted', () => {
    it('should create new progress if none exists', async () => {
      mockProgressRepository.findOne.mockResolvedValueOnce(null);

      await service.markAsCompleted('user-123', 'lesson-123', 'enrollment-123');

      expect(progressRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-123',
          lessonId: 'lesson-123',
          enrollmentId: 'enrollment-123',
          completed: true,
        }),
      );
      expect(progressRepository.save).toHaveBeenCalled();
    });

    it('should update existing progress', async () => {
      const existingProgress = {
        id: 'progress-123',
        userId: 'user-123',
        lessonId: 'lesson-123',
        enrollmentId: 'enrollment-123',
        completed: false,
      };
      mockProgressRepository.findOne.mockResolvedValueOnce(existingProgress);

      await service.markAsCompleted('user-123', 'lesson-123', 'enrollment-123');

      expect(progressRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          completed: true,
        }),
      );
    });
  });

  describe('updateWatchTime', () => {
    it('should create new progress if none exists', async () => {
      mockProgressRepository.findOne.mockResolvedValueOnce(null);

      await service.updateWatchTime('user-123', 'lesson-123', 'enrollment-123', 120, 60);

      expect(progressRepository.create).toHaveBeenCalledWith({
        userId: 'user-123',
        lessonId: 'lesson-123',
        enrollmentId: 'enrollment-123',
        watchTime: 120,
        lastPosition: 60,
      });
      expect(progressRepository.save).toHaveBeenCalled();
    });

    it('should update existing progress watch time', async () => {
      const existingProgress = {
        id: 'progress-123',
        userId: 'user-123',
        lessonId: 'lesson-123',
        enrollmentId: 'enrollment-123',
        watchTime: 60,
        lastPosition: 30,
      };
      mockProgressRepository.findOne.mockResolvedValueOnce(existingProgress);

      await service.updateWatchTime('user-123', 'lesson-123', 'enrollment-123', 180, 90);

      expect(progressRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          watchTime: 180,
          lastPosition: 90,
        }),
      );
    });
  });

  describe('getEnrollmentProgress', () => {
    it('should get all progress for an enrollment', async () => {
      const mockProgressList = [
        { id: 'progress-1', lessonId: 'lesson-1', enrollmentId: 'enrollment-123' },
        { id: 'progress-2', lessonId: 'lesson-2', enrollmentId: 'enrollment-123' },
      ];
      mockProgressRepository.find.mockResolvedValueOnce(mockProgressList);

      const result = await service.getEnrollmentProgress('enrollment-123');

      expect(progressRepository.find).toHaveBeenCalledWith({
        where: { enrollmentId: 'enrollment-123' },
        relations: ['lesson'],
        order: { createdAt: 'ASC' },
      });
      expect(result).toEqual(mockProgressList);
    });
  });

  describe('getUserProgress', () => {
    it('should get all progress for a user', async () => {
      const mockProgressList = [
        { id: 'progress-1', userId: 'user-123', lessonId: 'lesson-1' },
        { id: 'progress-2', userId: 'user-123', lessonId: 'lesson-2' },
      ];
      mockProgressRepository.find.mockResolvedValueOnce(mockProgressList);

      const result = await service.getUserProgress('user-123');

      expect(progressRepository.find).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        relations: ['lesson', 'enrollment'],
        order: { updatedAt: 'DESC' },
      });
      expect(result).toEqual(mockProgressList);
    });
  });

  describe('getNextLesson', () => {
    it('should return the next lesson in order', async () => {
      const nextLesson = { ...mockLesson, id: 'lesson-next', order: 1 };
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(nextLesson),
      };
      mockLessonRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getNextLesson('module-123', 'lesson-123');

      expect(result).toEqual(nextLesson);
    });

    it('should return null if no next lesson exists', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };
      mockLessonRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getNextLesson('module-123', 'lesson-123');

      expect(result).toBeNull();
    });
  });

  describe('getPreviousLesson', () => {
    it('should return the previous lesson in order', async () => {
      const previousLesson = { ...mockLesson, id: 'lesson-prev', order: -1 };
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(previousLesson),
      };
      mockLessonRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getPreviousLesson('module-123', 'lesson-123');

      expect(result).toEqual(previousLesson);
    });

    it('should return null if no previous lesson exists', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };
      mockLessonRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getPreviousLesson('module-123', 'lesson-123');

      expect(result).toBeNull();
    });
  });
});
