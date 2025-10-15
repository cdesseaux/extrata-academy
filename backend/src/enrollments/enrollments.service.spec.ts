import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EnrollmentsService } from './enrollments.service';
import { Enrollment } from './entities/enrollment.entity';
import { GamificationService } from '../gamification/gamification.service';
import { CertificatesService } from '../certificates/certificates.service';

describe('EnrollmentsService', () => {
  let service: EnrollmentsService;
  let repository: Repository<Enrollment>;

  const mockEnrollment = {
    id: 'enrollment-123',
    userId: 'user-123',
    courseId: 'course-123',
    status: 'enrolled',
    progress: 0,
    completedAt: null,
    certificateUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    create: jest.fn((dto) => dto),
    save: jest.fn((enrollment) => Promise.resolve({ ...mockEnrollment, ...enrollment })),
    find: jest.fn(() => Promise.resolve([mockEnrollment])),
    findOne: jest.fn(() => Promise.resolve(mockEnrollment)),
    update: jest.fn(() => Promise.resolve({ affected: 1 })),
  };

  const mockGamificationService = {
    addXP: jest.fn().mockResolvedValue(undefined),
    checkAndUnlockAchievements: jest.fn().mockResolvedValue(undefined),
  };

  const mockCertificatesService = {
    createCertificate: jest.fn().mockResolvedValue({
      id: 'cert-123',
      certificateUrl: '/uploads/certificates/cert-123.pdf',
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnrollmentsService,
        {
          provide: getRepositoryToken(Enrollment),
          useValue: mockRepository,
        },
        {
          provide: GamificationService,
          useValue: mockGamificationService,
        },
        {
          provide: CertificatesService,
          useValue: mockCertificatesService,
        },
      ],
    }).compile();

    service = module.get<EnrollmentsService>(EnrollmentsService);
    repository = module.get<Repository<Enrollment>>(getRepositoryToken(Enrollment));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an enrollment', async () => {
    const enrollmentData = {
      userId: 'user-123',
      courseId: 'course-123',
    };

    const result = await service.create(enrollmentData);

    expect(repository.create).toHaveBeenCalledWith(enrollmentData);
    expect(repository.save).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it('should find enrollments by user', async () => {
    const result = await service.findByUser('user-123');

    expect(repository.find).toHaveBeenCalled();
    expect(result).toEqual([mockEnrollment]);
  });

  it('should update progress', async () => {
    const result = await service.updateProgress('enrollment-123', 50);

    expect(repository.update).toHaveBeenCalledWith('enrollment-123', { progress: 50 });
    expect(result).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all enrollments with relations', async () => {
      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalledWith({
        relations: ['user', 'course'],
      });
      expect(result).toEqual([mockEnrollment]);
    });
  });

  describe('findOne', () => {
    it('should return an enrollment by ID', async () => {
      const result = await service.findOne('enrollment-123');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'enrollment-123' },
        relations: ['user', 'course'],
      });
      expect(result).toEqual(mockEnrollment);
    });

    it('should return null if enrollment not found', async () => {
      mockRepository.findOne.mockResolvedValueOnce(null);

      const result = await service.findOne('invalid-id');

      expect(result).toBeNull();
    });
  });

  describe('findByCourse', () => {
    it('should return enrollments for a specific course', async () => {
      const result = await service.findByCourse('course-123');

      expect(repository.find).toHaveBeenCalledWith({
        where: { courseId: 'course-123' },
        relations: ['user'],
      });
      expect(result).toEqual([mockEnrollment]);
    });
  });

  describe('findUserEnrollment', () => {
    it('should return enrollment for specific user and course', async () => {
      const result = await service.findUserEnrollment('user-123', 'course-123');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { userId: 'user-123', courseId: 'course-123' },
        relations: ['user', 'course'],
      });
      expect(result).toEqual(mockEnrollment);
    });
  });

  describe('update', () => {
    it('should update an enrollment', async () => {
      const updateData = { status: 'in_progress' };

      const result = await service.update('enrollment-123', updateData);

      expect(repository.update).toHaveBeenCalledWith('enrollment-123', updateData);
      expect(repository.findOne).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('remove', () => {
    it('should delete an enrollment', async () => {
      mockRepository.delete = jest.fn().mockResolvedValue({ affected: 1 });

      await service.remove('enrollment-123');

      expect(mockRepository.delete).toHaveBeenCalledWith('enrollment-123');
    });
  });

  describe('updateProgress with completion', () => {
    it('should complete enrollment and generate certificate at 100%', async () => {
      const result = await service.updateProgress('enrollment-123', 100);

      expect(mockGamificationService.addXP).toHaveBeenCalledWith(
        'user-123',
        500,
        expect.any(String),
        'Curso completado!',
        expect.objectContaining({ courseId: 'course-123' }),
      );
      expect(mockCertificatesService.createCertificate).toHaveBeenCalledWith(
        'user-123',
        'course-123',
        expect.any(Date),
      );
      expect(repository.update).toHaveBeenCalledWith(
        'enrollment-123',
        expect.objectContaining({
          status: 'completed',
          progress: 100,
          certificateUrl: '/uploads/certificates/cert-123.pdf',
        }),
      );
      expect(result).toBeDefined();
    });

    it('should handle certificate generation failure gracefully', async () => {
      mockCertificatesService.createCertificate.mockRejectedValueOnce(new Error('Certificate error'));

      const result = await service.updateProgress('enrollment-123', 100);

      // Should still complete the enrollment even if certificate fails
      expect(repository.update).toHaveBeenCalledWith(
        'enrollment-123',
        expect.objectContaining({
          status: 'completed',
          progress: 100,
        }),
      );
      expect(result).toBeDefined();
    });
  });

  describe('updateProgress with milestones', () => {
    it('should award XP for 25% milestone', async () => {
      await service.updateProgress('enrollment-123', 25);

      expect(mockGamificationService.addXP).toHaveBeenCalledWith(
        'user-123',
        50,
        expect.any(String),
        'Marco de 25% atingido!',
        expect.objectContaining({ progress: 25 }),
      );
    });

    it('should award XP for 50% milestone', async () => {
      await service.updateProgress('enrollment-123', 50);

      expect(mockGamificationService.addXP).toHaveBeenCalledWith(
        'user-123',
        100,
        expect.any(String),
        'Marco de 50% atingido!',
        expect.objectContaining({ progress: 50 }),
      );
    });

    it('should award XP for 75% milestone', async () => {
      await service.updateProgress('enrollment-123', 75);

      expect(mockGamificationService.addXP).toHaveBeenCalledWith(
        'user-123',
        150,
        expect.any(String),
        'Marco de 75% atingido!',
        expect.objectContaining({ progress: 75 }),
      );
    });

    it('should not award XP for non-milestone progress', async () => {
      await service.updateProgress('enrollment-123', 30);

      // Should only have one call for enrollment creation, not milestone
      expect(mockGamificationService.addXP).not.toHaveBeenCalled();
    });
  });

  describe('calculateProgressFromLessons', () => {
    it('should calculate progress based on completed lessons', async () => {
      const enrollmentWithCourse = {
        ...mockEnrollment,
        course: {
          id: 'course-123',
          modules: [
            {
              id: 'module-1',
              lessons: [
                { id: 'lesson-1' },
                { id: 'lesson-2' },
                { id: 'lesson-3' },
                { id: 'lesson-4' },
              ],
            },
            {
              id: 'module-2',
              lessons: [
                { id: 'lesson-5' },
                { id: 'lesson-6' },
              ],
            },
          ],
        },
      };

      mockRepository.findOne.mockResolvedValueOnce(enrollmentWithCourse);

      // Mock the manager and lesson progress repository
      const mockLessonProgressRepo = {
        count: jest.fn().mockResolvedValue(3), // 3 out of 6 lessons completed
      };
      mockRepository.manager = {
        getRepository: jest.fn().mockReturnValue(mockLessonProgressRepo),
      } as any;

      const result = await service.calculateProgressFromLessons('enrollment-123');

      expect(mockLessonProgressRepo.count).toHaveBeenCalledWith({
        where: {
          enrollmentId: 'enrollment-123',
          completed: true,
        },
      });
      // 3/6 = 50%
      expect(repository.update).toHaveBeenCalledWith(
        'enrollment-123',
        expect.objectContaining({ progress: 50 }),
      );
      expect(result).toBeDefined();
    });

    it('should handle enrollment with no lessons', async () => {
      const enrollmentWithNoLessons = {
        ...mockEnrollment,
        course: {
          id: 'course-123',
          modules: [
            {
              id: 'module-1',
              lessons: [],
            },
          ],
        },
      };

      mockRepository.findOne.mockResolvedValueOnce(enrollmentWithNoLessons);

      const result = await service.calculateProgressFromLessons('enrollment-123');

      expect(result).toEqual(enrollmentWithNoLessons);
    });

    it('should return null if enrollment not found', async () => {
      mockRepository.findOne.mockResolvedValueOnce(null);

      const result = await service.calculateProgressFromLessons('invalid-id');

      expect(result).toBeNull();
    });
  });
});
