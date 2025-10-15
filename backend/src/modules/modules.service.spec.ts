import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ModulesService } from './modules.service';
import { Module } from './entities/module.entity';

describe('ModulesService', () => {
  let service: ModulesService;
  let repository: Repository<Module>;

  const mockModule = {
    id: 'module-123',
    courseId: 'course-123',
    title: 'Test Module',
    description: 'Test Description',
    order: 0,
    duration: 30,
    isActive: true,
    lessons: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    create: jest.fn((dto) => dto),
    save: jest.fn((module) => Promise.resolve({ ...mockModule, ...module })),
    find: jest.fn(() => Promise.resolve([mockModule])),
    findOne: jest.fn(() => Promise.resolve(mockModule)),
    update: jest.fn(() => Promise.resolve({ affected: 1 })),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({ maxOrder: 0 }),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModulesService,
        {
          provide: getRepositoryToken(Module),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ModulesService>(ModulesService);
    repository = module.get<Repository<Module>>(getRepositoryToken(Module));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a module', async () => {
    const moduleData = {
      courseId: 'course-123',
      title: 'New Module',
      description: 'New Description',
    };

    const result = await service.create(moduleData);

    expect(repository.create).toHaveBeenCalledWith({
      ...moduleData,
      order: 1, // Service adds order based on maxOrder + 1
    });
    expect(repository.save).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it('should find modules by course', async () => {
    const result = await service.findByCourse('course-123');

    expect(repository.find).toHaveBeenCalled();
    expect(result).toEqual([mockModule]);
  });

  it('should update a module', async () => {
    const updateData = { title: 'Updated Module' };
    const result = await service.update('module-123', updateData);

    expect(repository.findOne).toHaveBeenCalled();
    expect(repository.save).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all active modules', async () => {
      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalledWith({
        where: { isActive: true },
        relations: ['lessons', 'course'],
        order: { order: 'ASC', createdAt: 'ASC' },
      });
      expect(result).toEqual([mockModule]);
    });
  });

  describe('findOne', () => {
    it('should return a module by ID', async () => {
      const result = await service.findOne('module-123');

      expect(repository.findOne).toHaveBeenCalled();
      expect(result).toEqual(mockModule);
    });

    it('should throw NotFoundException if module not found', async () => {
      mockRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(
        'Módulo com ID invalid-id não encontrado',
      );
    });
  });

  describe('remove', () => {
    it('should soft delete a module', async () => {
      await service.remove('module-123');

      expect(repository.findOne).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          isActive: false,
        }),
      );
    });
  });

  describe('reorder', () => {
    it('should reorder modules in a course', async () => {
      const moduleOrders = [
        { id: 'module-1', order: 0 },
        { id: 'module-2', order: 1 },
        { id: 'module-3', order: 2 },
      ];

      const result = await service.reorder('course-123', moduleOrders);

      expect(repository.update).toHaveBeenCalledTimes(3);
      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual([mockModule]);
    });
  });

  describe('duplicate', () => {
    it('should duplicate a module', async () => {
      // Reset the mock to return the original module data
      mockRepository.findOne.mockResolvedValueOnce(mockModule);

      const result = await service.duplicate('module-123');

      expect(repository.findOne).toHaveBeenCalled();
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          courseId: 'course-123',
          description: 'Test Description',
        }),
      );
      // Check that title ends with (Cópia)
      const createCall = mockRepository.create.mock.calls[mockRepository.create.mock.calls.length - 1][0];
      expect(createCall.title).toContain('(Cópia)');
      expect(repository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('updateDuration', () => {
    it('should calculate and update module duration from lessons', async () => {
      const moduleWithLessons = {
        ...mockModule,
        lessons: [
          { id: 'l1', duration: 600, isActive: true },
          { id: 'l2', duration: 900, isActive: true },
          { id: 'l3', duration: 300, isActive: false }, // should be ignored
        ],
      };
      mockRepository.findOne.mockResolvedValueOnce(moduleWithLessons);

      const result = await service.updateDuration('module-123');

      // 600 + 900 = 1500 seconds = 25 minutes
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          duration: 25,
        }),
      );
      expect(result).toBeDefined();
    });

    it('should handle module with no lessons', async () => {
      const moduleWithNoLessons = {
        ...mockModule,
        lessons: [],
      };
      mockRepository.findOne.mockResolvedValueOnce(moduleWithNoLessons);

      const result = await service.updateDuration('module-123');

      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          duration: 0,
        }),
      );
      expect(result).toBeDefined();
    });

    it('should handle module with undefined lessons', async () => {
      const moduleWithUndefinedLessons = {
        ...mockModule,
        lessons: undefined,
      };
      mockRepository.findOne.mockResolvedValueOnce(moduleWithUndefinedLessons);

      const result = await service.updateDuration('module-123');

      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          duration: 0,
        }),
      );
      expect(result).toBeDefined();
    });
  });
});
