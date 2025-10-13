import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoursesService } from './courses.service';
import { Course } from './entities/course.entity';

describe('CoursesService', () => {
  let service: CoursesService;
  let repository: Repository<Course>;

  const mockCourse: Course = {
    id: 'course-123',
    title: 'Test Course',
    description: 'Test Description',
    thumbnailUrl: 'https://example.com/thumb.jpg',
    duration: 60,
    difficulty: 3,
    tags: ['test', 'course'],
    isActive: true,
    isPublished: false,
    instructorId: 'instructor-123',
    instructor: null,
    modules: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    create: jest.fn((dto) => dto),
    save: jest.fn((course) => Promise.resolve({ ...mockCourse, ...course })),
    find: jest.fn(() => Promise.resolve([mockCourse])),
    findOne: jest.fn(() => Promise.resolve(mockCourse)),
    update: jest.fn(() => Promise.resolve({ affected: 1 })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        {
          provide: getRepositoryToken(Course),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
    repository = module.get<Repository<Course>>(getRepositoryToken(Course));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new course', async () => {
      const courseData = {
        title: 'New Course',
        description: 'New Description',
        instructorId: 'instructor-123',
      };

      const result = await service.create(courseData);

      expect(repository.create).toHaveBeenCalledWith(courseData);
      expect(repository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return an array of active courses', async () => {
      const result = await service.findAll();

      expect(result).toEqual([mockCourse]);
      expect(repository.find).toHaveBeenCalledWith({
        relations: ['instructor', 'modules', 'modules.lessons'],
        where: { isActive: true },
        order: {
          modules: {
            order: 'ASC',
            lessons: {
              order: 'ASC',
            },
          },
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a course by id', async () => {
      const result = await service.findOne('course-123');

      expect(result).toEqual(mockCourse);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'course-123' },
        relations: ['instructor', 'modules', 'modules.lessons'],
        order: {
          modules: {
            order: 'ASC',
            lessons: {
              order: 'ASC',
            },
          },
        },
      });
    });
  });

  describe('findByInstructor', () => {
    it('should return courses by instructor', async () => {
      const result = await service.findByInstructor('instructor-123');

      expect(result).toEqual([mockCourse]);
      expect(repository.find).toHaveBeenCalledWith({
        where: { instructorId: 'instructor-123', isActive: true },
        relations: ['instructor', 'modules', 'modules.lessons'],
        order: {
          modules: {
            order: 'ASC',
            lessons: {
              order: 'ASC',
            },
          },
        },
      });
    });
  });

  describe('update', () => {
    it('should update a course', async () => {
      const updateData = { title: 'Updated Course' };
      const result = await service.update('course-123', updateData);

      expect(repository.update).toHaveBeenCalledWith('course-123', updateData);
      expect(repository.findOne).toHaveBeenCalled();
      expect(result).toEqual(mockCourse);
    });
  });

  describe('remove', () => {
    it('should soft delete a course', async () => {
      await service.remove('course-123');

      expect(repository.update).toHaveBeenCalledWith('course-123', { isActive: false });
    });
  });

  describe('publish', () => {
    it('should publish a course', async () => {
      const result = await service.publish('course-123');

      expect(repository.update).toHaveBeenCalledWith('course-123', { isPublished: true });
      expect(result).toEqual(mockCourse);
    });
  });

  describe('unpublish', () => {
    it('should unpublish a course', async () => {
      const result = await service.unpublish('course-123');

      expect(repository.update).toHaveBeenCalledWith('course-123', { isPublished: false });
      expect(result).toEqual(mockCourse);
    });
  });

  describe('updateCourseDuration', () => {
    it('should update course duration based on modules', async () => {
      const courseWithModules = {
        ...mockCourse,
        modules: [
          { id: 'mod-1', duration: 30 } as any,
          { id: 'mod-2', duration: 45 } as any,
        ],
      };

      mockRepository.findOne.mockResolvedValueOnce(courseWithModules);

      const result = await service.updateCourseDuration('course-123');

      expect(repository.update).toHaveBeenCalledWith('course-123', { duration: 75 });
      expect(result).toBeDefined();
    });

    it('should return null if course not found', async () => {
      mockRepository.findOne.mockResolvedValueOnce(null);

      const result = await service.updateCourseDuration('non-existent');

      expect(result).toBeNull();
    });
  });
});
