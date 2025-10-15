import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LearningPathsService } from './learning-paths.service';
import { LearningPath } from './entities/learning-path.entity';
import { LearningPathCourse } from './entities/learning-path-course.entity';
import { LearningPathEnrollment } from './entities/learning-path-enrollment.entity';

describe('LearningPathsService', () => {
  let service: LearningPathsService;
  let learningPathRepository: Repository<LearningPath>;
  let learningPathCourseRepository: Repository<LearningPathCourse>;
  let learningPathEnrollmentRepository: Repository<LearningPathEnrollment>;

  const mockLearningPath = {
    id: 'path-123',
    title: 'Full Stack Developer',
    description: 'Complete path to become a full stack developer',
    level: 'intermediate',
    estimatedDuration: 120,
    isActive: true,
    courses: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockLearningPathCourse = {
    id: 'pathcourse-123',
    learningPathId: 'path-123',
    courseId: 'course-123',
    order: 0,
    isRequired: true,
    createdAt: new Date(),
  };

  const mockLearningPathEnrollment = {
    id: 'enrollment-123',
    learningPathId: 'path-123',
    userId: 'user-123',
    progress: 50,
    currentCourseId: 'course-123',
    status: 'in_progress',
    startedAt: new Date(),
    completedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockLearningPathRepository = {
    create: jest.fn((dto) => dto),
    save: jest.fn((path) => Promise.resolve({ ...mockLearningPath, ...path })),
    find: jest.fn(() => Promise.resolve([mockLearningPath])),
    findOne: jest.fn(() => Promise.resolve(mockLearningPath)),
    update: jest.fn(() => Promise.resolve({ affected: 1 })),
  };

  const mockLearningPathCourseRepository = {
    create: jest.fn((dto) => dto),
    save: jest.fn((course) => Promise.resolve({ ...mockLearningPathCourse, ...course })),
    find: jest.fn(() => Promise.resolve([mockLearningPathCourse])),
    delete: jest.fn(() => Promise.resolve({ affected: 1 })),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({ maxOrder: 0 }),
    })),
  };

  const mockLearningPathEnrollmentRepository = {
    create: jest.fn((dto) => dto),
    save: jest.fn((enrollment) => Promise.resolve({ ...mockLearningPathEnrollment, ...enrollment })),
    find: jest.fn(() => Promise.resolve([mockLearningPathEnrollment])),
    findOne: jest.fn(() => Promise.resolve(mockLearningPathEnrollment)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LearningPathsService,
        {
          provide: getRepositoryToken(LearningPath),
          useValue: mockLearningPathRepository,
        },
        {
          provide: getRepositoryToken(LearningPathCourse),
          useValue: mockLearningPathCourseRepository,
        },
        {
          provide: getRepositoryToken(LearningPathEnrollment),
          useValue: mockLearningPathEnrollmentRepository,
        },
      ],
    }).compile();

    service = module.get<LearningPathsService>(LearningPathsService);
    learningPathRepository = module.get<Repository<LearningPath>>(getRepositoryToken(LearningPath));
    learningPathCourseRepository = module.get<Repository<LearningPathCourse>>(getRepositoryToken(LearningPathCourse));
    learningPathEnrollmentRepository = module.get<Repository<LearningPathEnrollment>>(getRepositoryToken(LearningPathEnrollment));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a learning path', async () => {
      const pathData = {
        title: 'New Path',
        slug: 'new-path',
        description: 'Path description',
        targetRole: 'developer',
        estimatedHours: 120,
      };

      const result = await service.create(pathData);

      expect(learningPathRepository.create).toHaveBeenCalled();
      expect(learningPathRepository.save).toHaveBeenCalled();
      expect(learningPathRepository.findOne).toHaveBeenCalled(); // findOne is called at the end
      expect(result).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return all active learning paths', async () => {
      const result = await service.findAll();

      expect(learningPathRepository.find).toHaveBeenCalled();
      expect(result).toEqual([mockLearningPath]);
    });
  });

  describe('findOne', () => {
    it('should return a learning path by ID', async () => {
      const result = await service.findOne('path-123');

      expect(learningPathRepository.findOne).toHaveBeenCalled();
      expect(result).toEqual(mockLearningPath);
    });
  });

  describe('enroll', () => {
    it('should enroll a user in a learning path', async () => {
      mockLearningPathEnrollmentRepository.findOne.mockResolvedValue(null); // No existing enrollment

      const result = await service.enroll('user-123', 'path-123');

      expect(learningPathEnrollmentRepository.findOne).toHaveBeenCalled(); // Checks for existing enrollment
      expect(learningPathRepository.findOne).toHaveBeenCalled(); // findOne is called
      expect(learningPathEnrollmentRepository.create).toHaveBeenCalled();
      expect(learningPathEnrollmentRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('getEnrollment', () => {
    it('should return user enrollment for a path', async () => {
      mockLearningPathEnrollmentRepository.findOne.mockResolvedValue(mockLearningPathEnrollment);

      const result = await service.getEnrollment('user-123', 'path-123');

      expect(learningPathEnrollmentRepository.findOne).toHaveBeenCalled();
      expect(result).toEqual(mockLearningPathEnrollment);
    });
  });

  describe('updateProgress', () => {
    it('should update enrollment progress', async () => {
      // Need to return an enrollment when findOne is called
      mockLearningPathEnrollmentRepository.findOne.mockResolvedValue(mockLearningPathEnrollment);

      const result = await service.updateProgress('user-123', 'path-123', 75);

      expect(learningPathEnrollmentRepository.findOne).toHaveBeenCalled();
      expect(learningPathEnrollmentRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });
});
