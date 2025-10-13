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

    expect(repository.create).toHaveBeenCalledWith(moduleData);
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

    expect(repository.update).toHaveBeenCalledWith('module-123', updateData);
    expect(result).toBeDefined();
  });
});
