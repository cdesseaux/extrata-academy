import { Test, TestingModule } from '@nestjs/testing';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';

describe('CoursesController', () => {
  let controller: CoursesController;
  let service: CoursesService;

  const mockCourse = {
    id: 'course-123',
    title: 'Test Course',
    description: 'Test Description',
    slug: 'test-course',
    thumbnailUrl: 'https://example.com/thumb.jpg',
    level: 'beginner',
    duration: 120,
    isActive: true,
    isFeatured: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCoursesService = {
    create: jest.fn().mockResolvedValue(mockCourse),
    findAll: jest.fn().mockResolvedValue([mockCourse]),
    findOne: jest.fn().mockResolvedValue(mockCourse),
    update: jest.fn().mockResolvedValue(mockCourse),
    remove: jest.fn().mockResolvedValue(undefined),
    publish: jest.fn().mockResolvedValue(mockCourse),
    unpublish: jest.fn().mockResolvedValue(mockCourse),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoursesController],
      providers: [
        {
          provide: CoursesService,
          useValue: mockCoursesService,
        },
      ],
    }).compile();

    controller = module.get<CoursesController>(CoursesController);
    service = module.get<CoursesService>(CoursesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a course', async () => {
      const createDto = {
        title: 'Test Course',
        description: 'Test Description',
        slug: 'test-course',
      };

      const mockRequest = {
        user: { id: 'user-123', email: 'test@example.com' },
      };

      const result = await controller.create(createDto, mockRequest as any);

      expect(service.create).toHaveBeenCalledWith({
        ...createDto,
        instructorId: 'user-123',
      });
      expect(result).toEqual(mockCourse);
    });
  });

  describe('findAll', () => {
    it('should return all courses', async () => {
      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockCourse]);
    });
  });

  describe('findOne', () => {
    it('should return a course by ID', async () => {
      const result = await controller.findOne('course-123');

      expect(service.findOne).toHaveBeenCalledWith('course-123');
      expect(result).toEqual(mockCourse);
    });
  });

  describe('update', () => {
    it('should update a course', async () => {
      const updateDto = { title: 'Updated Course' };

      const result = await controller.update('course-123', updateDto);

      expect(service.update).toHaveBeenCalledWith('course-123', updateDto);
      expect(result).toEqual(mockCourse);
    });
  });

  describe('remove', () => {
    it('should remove a course', async () => {
      await controller.remove('course-123');

      expect(service.remove).toHaveBeenCalledWith('course-123');
    });
  });

  describe('publish', () => {
    it('should publish a course', async () => {
      const result = await controller.publish('course-123');

      expect(service.publish).toHaveBeenCalledWith('course-123');
      expect(result).toEqual(mockCourse);
    });
  });
});
