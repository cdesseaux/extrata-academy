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

  describe('findAll', () => {
    it('should return all quizzes', async () => {
      const result = await service.findAll();

      expect(quizRepository.find).toHaveBeenCalledWith({
        relations: ['lesson', 'questions'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual([mockQuiz]);
    });
  });

  describe('findOne', () => {
    it('should return a quiz by ID', async () => {
      const result = await service.findOne('quiz-123');

      expect(quizRepository.findOne).toHaveBeenCalled();
      expect(result).toEqual(mockQuiz);
    });

    it('should throw NotFoundException if quiz not found', async () => {
      mockQuizRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow('Quiz com ID invalid-id não encontrado');
    });
  });

  describe('update', () => {
    it('should update a quiz', async () => {
      const updateData = { title: 'Updated Quiz' };

      const result = await service.update('quiz-123', updateData);

      expect(quizRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('remove', () => {
    it('should soft delete a quiz', async () => {
      await service.remove('quiz-123');

      expect(quizRepository.save).toHaveBeenCalled();
    });
  });

  describe('updateQuestion', () => {
    it('should update a question', async () => {
      const updateData = { text: 'Updated question' };

      const result = await service.updateQuestion('question-123', updateData);

      expect(questionRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if question not found', async () => {
      mockQuestionRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.updateQuestion('invalid-id', {})).rejects.toThrow(
        'Questão com ID invalid-id não encontrada',
      );
    });
  });

  describe('deleteQuestion', () => {
    it('should soft delete a question', async () => {
      await service.deleteQuestion('question-123');

      expect(questionRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if question not found', async () => {
      mockQuestionRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.deleteQuestion('invalid-id')).rejects.toThrow(
        'Questão com ID invalid-id não encontrada',
      );
    });
  });

  describe('reorderQuestions', () => {
    it('should reorder questions', async () => {
      const reorderDto = {
        questionIds: ['q1', 'q2', 'q3'],
      };

      await service.reorderQuestions('quiz-123', reorderDto);

      expect(questionRepository.update).toHaveBeenCalledTimes(3);
    });
  });

  describe('submitQuiz', () => {
    it('should submit and grade a quiz attempt', async () => {
      const mockAttemptWithQuiz = {
        ...mockQuizAttempt,
        completedAt: null,
        quiz: {
          ...mockQuiz,
          questions: [
            {
              ...mockQuestion,
              correctAnswers: ['2'],
            },
          ],
        },
      };

      mockQuizAttemptRepository.findOne.mockResolvedValueOnce(mockAttemptWithQuiz);

      const submitDto = {
        answers: [{ questionId: 'question-123', answer: ['2'] }],
      };

      const result = await service.submitQuiz('attempt-123', submitDto);

      expect(quizAttemptRepository.findOne).toHaveBeenCalled();
      expect(quizAttemptRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if attempt not found', async () => {
      mockQuizAttemptRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.submitQuiz('invalid-id', { answers: [] })).rejects.toThrow(
        'Tentativa com ID invalid-id não encontrada',
      );
    });

    it('should throw BadRequestException if quiz already completed', async () => {
      const completedAttempt = {
        ...mockQuizAttempt,
        completedAt: new Date(),
      };
      mockQuizAttemptRepository.findOne.mockResolvedValueOnce(completedAttempt);

      await expect(service.submitQuiz('attempt-123', { answers: [] })).rejects.toThrow(
        'Quiz já foi finalizado',
      );
    });
  });

  describe('canRetake', () => {
    it('should return true if user can retake quiz', async () => {
      mockQuizAttemptRepository.count.mockResolvedValueOnce(1);

      const result = await service.canRetake('user-123', 'quiz-123');

      expect(result).toBe(true);
    });

    it('should return false if max attempts reached', async () => {
      mockQuizAttemptRepository.count.mockResolvedValueOnce(3);

      const result = await service.canRetake('user-123', 'quiz-123');

      expect(result).toBe(false);
    });

    it('should return true if maxAttempts is 0 (unlimited)', async () => {
      mockQuizRepository.findOne.mockResolvedValueOnce({
        ...mockQuiz,
        maxAttempts: 0,
      });
      mockQuizAttemptRepository.count.mockResolvedValueOnce(10);

      const result = await service.canRetake('user-123', 'quiz-123');

      expect(result).toBe(true);
    });
  });

  describe('getBestAttempt', () => {
    it('should return the best attempt', async () => {
      const result = await service.getBestAttempt('user-123', 'quiz-123');

      expect(quizAttemptRepository.find).toHaveBeenCalledWith({
        where: { userId: 'user-123', quizId: 'quiz-123' },
        order: { score: 'DESC' },
        take: 1,
      });
      expect(result).toEqual(mockQuizAttempt);
    });

    it('should return null if no attempts found', async () => {
      mockQuizAttemptRepository.find.mockResolvedValueOnce([]);

      const result = await service.getBestAttempt('user-123', 'quiz-123');

      expect(result).toBeNull();
    });
  });
});
