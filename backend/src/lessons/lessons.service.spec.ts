import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LessonsService } from './lessons.service';
import { Lesson, LessonContentType } from './entities/lesson.entity';
import { LessonProgress } from './entities/lesson-progress.entity';

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
  };

  const mockProgressRepository = {
    create: jest.fn((dto) => dto),
    save: jest.fn((progress) => Promise.resolve(progress)),
    findOne: jest.fn(() => Promise.resolve(null)),
    find: jest.fn(() => Promise.resolve([])),
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

    expect(lessonRepository.create).toHaveBeenCalledWith(lessonData);
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

    await service.markAsCompleted('lesson-123', userId, enrollmentId);

    expect(progressRepository.save).toHaveBeenCalled();
  });
});
