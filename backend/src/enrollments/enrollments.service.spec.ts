import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EnrollmentsService } from './enrollments.service';
import { Enrollment } from './entities/enrollment.entity';

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnrollmentsService,
        {
          provide: getRepositoryToken(Enrollment),
          useValue: mockRepository,
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
});
