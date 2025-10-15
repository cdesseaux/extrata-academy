import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizzesService } from './quizzes.service';
import { Quiz } from './entities/quiz.entity';
import { Question } from './entities/question.entity';
import { QuizAttempt } from './entities/quiz-attempt.entity';

describe('QuizzesService', () => {
  let service: QuizzesService;
  let quizRepository: Repository<Quiz>;
  let questionRepository: Repository<Question>;
  let quizAttemptRepository: Repository<QuizAttempt>;

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

  const mockQuestion = {
    id: 'question-123',
    quizId: 'quiz-123',
    text: 'What is 2+2?',
    type: 'multiple_choice',
    options: [
      { id: '1', text: '3', isCorrect: false },
      { id: '2', text: '4', isCorrect: true },
    ],
    points: 10,
    order: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockQuizAttempt = {
    id: 'attempt-123',
    quizId: 'quiz-123',
    userId: 'user-123',
    score: 80,
    passed: true,
    answers: {},
    startedAt: new Date(),
    completedAt: new Date(),
    createdAt: new Date(),
  };

  const mockQuizRepository = {
    create: jest.fn((dto) => dto),
    save: jest.fn((quiz) => Promise.resolve({ ...mockQuiz, ...quiz })),
    find: jest.fn(() => Promise.resolve([mockQuiz])),
    findOne: jest.fn(() => Promise.resolve(mockQuiz)),
    update: jest.fn(() => Promise.resolve({ affected: 1 })),
  };

  const mockQuestionRepository = {
    create: jest.fn((dto) => dto),
    save: jest.fn((question) => Promise.resolve({ ...mockQuestion, ...question })),
    find: jest.fn(() => Promise.resolve([mockQuestion])),
    findOne: jest.fn(() => Promise.resolve(mockQuestion)),
    update: jest.fn(() => Promise.resolve({ affected: 1 })),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({ maxOrder: 0 }),
    })),
  };

  const mockQuizAttemptRepository = {
    create: jest.fn((dto) => dto),
    save: jest.fn((attempt) => Promise.resolve({ ...mockQuizAttempt, ...attempt })),
    find: jest.fn(() => Promise.resolve([mockQuizAttempt])),
    findOne: jest.fn(() => Promise.resolve(mockQuizAttempt)),
    count: jest.fn(() => Promise.resolve(1)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizzesService,
        {
          provide: getRepositoryToken(Quiz),
          useValue: mockQuizRepository,
        },
        {
          provide: getRepositoryToken(Question),
          useValue: mockQuestionRepository,
        },
        {
          provide: getRepositoryToken(QuizAttempt),
          useValue: mockQuizAttemptRepository,
        },
      ],
    }).compile();

    service = module.get<QuizzesService>(QuizzesService);
    quizRepository = module.get<Repository<Quiz>>(getRepositoryToken(Quiz));
    questionRepository = module.get<Repository<Question>>(getRepositoryToken(Question));
    quizAttemptRepository = module.get<Repository<QuizAttempt>>(getRepositoryToken(QuizAttempt));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a quiz', async () => {
      const quizData = {
        lessonId: 'lesson-123',
        title: 'New Quiz',
        passingScore: 70,
      };

      const result = await service.create(quizData);

      expect(quizRepository.create).toHaveBeenCalledWith(quizData);
      expect(quizRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('findByLesson', () => {
    it('should find quiz by lesson ID', async () => {
      const result = await service.findByLesson('lesson-123');

      expect(quizRepository.findOne).toHaveBeenCalled();
      expect(result).toEqual(mockQuiz);
    });
  });

  describe('addQuestion', () => {
    it('should add a question to quiz', async () => {
      const questionData = {
        text: 'What is 2+2?',
        type: 'multiple_choice' as const,
        options: [{ text: '4', isCorrect: true }],
        points: 10,
      };

      const result = await service.addQuestion('quiz-123', questionData);

      expect(questionRepository.create).toHaveBeenCalled();
      expect(questionRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('startAttempt', () => {
    it('should start a quiz attempt', async () => {
      const result = await service.startAttempt('quiz-123', 'user-123', 'enrollment-123');

      expect(quizAttemptRepository.create).toHaveBeenCalled();
      expect(quizAttemptRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('getAttempts', () => {
    it('should get user attempts for a quiz', async () => {
      const result = await service.getAttempts('user-123', 'quiz-123');

      expect(quizAttemptRepository.find).toHaveBeenCalled();
      expect(result).toEqual([mockQuizAttempt]);
    });
  });
});
