import { Test, TestingModule } from '@nestjs/testing';
import { ModulesController } from './modules.controller';
import { ModulesService } from './modules.service';

describe('ModulesController', () => {
  let controller: ModulesController;
  let service: ModulesService;

  const mockModule = {
    id: 'module-123',
    courseId: 'course-123',
    title: 'Test Module',
    description: 'Test Description',
    order: 1,
    duration: 60,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRequest = {
    user: { id: 'user-123', email: 'test@example.com' },
  };

  const mockModulesService = {
    create: jest.fn().mockResolvedValue(mockModule),
    findAll: jest.fn().mockResolvedValue([mockModule]),
    findOne: jest.fn().mockResolvedValue(mockModule),
    findByCourse: jest.fn().mockResolvedValue([mockModule]),
    update: jest.fn().mockResolvedValue(mockModule),
    remove: jest.fn().mockResolvedValue(undefined),
    reorder: jest.fn().mockResolvedValue([mockModule]),
    duplicate: jest.fn().mockResolvedValue(mockModule),
    updateDuration: jest.fn().mockResolvedValue(mockModule),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ModulesController],
      providers: [
        {
          provide: ModulesService,
          useValue: mockModulesService,
        },
      ],
    }).compile();

    controller = module.get<ModulesController>(ModulesController);
    service = module.get<ModulesService>(ModulesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a module', async () => {
      const createDto = {
        courseId: 'course-123',
        title: 'Test Module',
        description: 'Test Description',
      };

      const result = await controller.create(createDto, mockRequest as any);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockModule);
    });
  });

  describe('findAll', () => {
    it('should return all modules', async () => {
      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockModule]);
    });
  });

  describe('findByCourse', () => {
    it('should return modules for a specific course', async () => {
      const result = await controller.findByCourse('course-123');

      expect(service.findByCourse).toHaveBeenCalledWith('course-123');
      expect(result).toEqual([mockModule]);
    });
  });

  describe('findOne', () => {
    it('should return a module by ID', async () => {
      const result = await controller.findOne('module-123');

      expect(service.findOne).toHaveBeenCalledWith('module-123');
      expect(result).toEqual(mockModule);
    });
  });

  describe('update', () => {
    it('should update a module', async () => {
      const updateDto = { title: 'Updated Module' };

      const result = await controller.update('module-123', updateDto);

      expect(service.update).toHaveBeenCalledWith('module-123', updateDto);
      expect(result).toEqual(mockModule);
    });
  });

  describe('remove', () => {
    it('should remove a module', async () => {
      await controller.remove('module-123');

      expect(service.remove).toHaveBeenCalledWith('module-123');
    });
  });

  describe('reorder', () => {
    it('should reorder modules in a course', async () => {
      const body = {
        moduleOrders: [
          { id: 'module-1', order: 0 },
          { id: 'module-2', order: 1 },
        ],
      };

      const result = await controller.reorder('course-123', body);

      expect(service.reorder).toHaveBeenCalledWith('course-123', body.moduleOrders);
      expect(result).toEqual([mockModule]);
    });
  });

  describe('duplicate', () => {
    it('should duplicate a module', async () => {
      const result = await controller.duplicate('module-123');

      expect(service.duplicate).toHaveBeenCalledWith('module-123');
      expect(result).toEqual(mockModule);
    });
  });

  describe('updateDuration', () => {
    it('should update module duration', async () => {
      const result = await controller.updateDuration('module-123');

      expect(service.updateDuration).toHaveBeenCalledWith('module-123');
      expect(result).toEqual(mockModule);
    });
  });
});
