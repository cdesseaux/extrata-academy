import { Test, TestingModule } from '@nestjs/testing';
import { QuizzesController } from './quizzes.controller';
import { QuizzesService } from './quizzes.service';

describe('QuizzesController', () => {
  let controller: QuizzesController;
  let service: QuizzesService;

  const mockQuiz = {
    id: 'quiz-123',
    lessonId: 'lesson-123',
    title: 'Test Quiz',
    description: 'Test Description',
    passingScore: 70,
    timeLimit: 600,
    maxAttempts: 3,
    isActive: true,
    questions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAttempt = {
    id: 'attempt-123',
    quizId: 'quiz-123',
    userId: 'user-123',
    score: 85,
    passed: true,
    answers: {},
    startedAt: new Date(),
    completedAt: new Date(),
    createdAt: new Date(),
  };

  const mockRequest = {
    user: { sub: 'user-123', email: 'test@example.com' },
    body: { enrollmentId: 'enrollment-123' },
  };

  const mockQuizzesService = {
    create: jest.fn().mockResolvedValue(mockQuiz),
    findAll: jest.fn().mockResolvedValue([mockQuiz]),
    findOne: jest.fn().mockResolvedValue(mockQuiz),
    findByLesson: jest.fn().mockResolvedValue(mockQuiz),
    update: jest.fn().mockResolvedValue(mockQuiz),
    remove: jest.fn().mockResolvedValue(undefined),
    startAttempt: jest.fn().mockResolvedValue(mockAttempt),
    submitQuiz: jest.fn().mockResolvedValue(mockAttempt),
    getAttempts: jest.fn().mockResolvedValue([mockAttempt]),
    canRetake: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuizzesController],
      providers: [
        {
          provide: QuizzesService,
          useValue: mockQuizzesService,
        },
      ],
    }).compile();

    controller = module.get<QuizzesController>(QuizzesController);
    service = module.get<QuizzesService>(QuizzesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a quiz', async () => {
      const createDto = {
        lessonId: 'lesson-123',
        title: 'Test Quiz',
        passingScore: 70,
      };

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockQuiz);
    });
  });

  describe('findAll', () => {
    it('should return all quizzes', async () => {
      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockQuiz]);
    });
  });

  describe('findOne', () => {
    it('should return a quiz by ID', async () => {
      const result = await controller.findOne('quiz-123');

      expect(service.findOne).toHaveBeenCalledWith('quiz-123');
      expect(result).toEqual(mockQuiz);
    });
  });

  describe('startAttempt', () => {
    it('should start a quiz attempt', async () => {
      const result = await controller.startAttempt('quiz-123', mockRequest as any);

      expect(service.startAttempt).toHaveBeenCalledWith(
        'quiz-123',
        'user-123',
        'enrollment-123',
      );
      expect(result).toEqual(mockAttempt);
    });
  });

  describe('submitQuiz', () => {
    it('should submit a quiz attempt', async () => {
      const submitDto = { answers: [] };

      const result = await controller.submitQuiz('attempt-123', submitDto);

      expect(service.submitQuiz).toHaveBeenCalledWith('attempt-123', submitDto);
      expect(result).toEqual(mockAttempt);
    });
  });

  describe('getMyAttempts', () => {
    it('should return user attempts for a quiz', async () => {
      const result = await controller.getMyAttempts(
        'quiz-123',
        mockRequest as any,
      );

      expect(service.getAttempts).toHaveBeenCalledWith('user-123', 'quiz-123');
      expect(result).toEqual([mockAttempt]);
    });
  });

  describe('canRetake', () => {
    it('should check if user can retake quiz', async () => {
      const result = await controller.canRetake('quiz-123', mockRequest as any);

      expect(service.canRetake).toHaveBeenCalledWith('user-123', 'quiz-123');
      expect(result).toBe(true); // Service returns boolean, not object
    });
  });
});
