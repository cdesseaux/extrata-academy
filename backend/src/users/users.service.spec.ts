import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  const mockUser: User = {
    id: 'user-123',
    keycloakId: 'kc-123',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    username: 'johndoe',
    roles: ['user'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    create: jest.fn((dto) => dto),
    save: jest.fn((user) => Promise.resolve({ ...mockUser, ...user })),
    find: jest.fn(() => Promise.resolve([mockUser])),
    findOne: jest.fn(({ where }) => {
      if (where.id === mockUser.id || where.keycloakId === mockUser.keycloakId) {
        return Promise.resolve(mockUser);
      }
      return Promise.resolve(null);
    }),
    update: jest.fn(() => Promise.resolve({ affected: 1 })),
    delete: jest.fn(() => Promise.resolve({ affected: 1 })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const userData = {
        keycloakId: 'kc-456',
        email: 'new@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
      };

      const result = await service.create(userData);

      expect(repository.create).toHaveBeenCalledWith(userData);
      expect(repository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const result = await service.findAll();

      expect(result).toEqual([mockUser]);
      expect(repository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const result = await service.findOne('user-123');

      expect(result).toEqual(mockUser);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 'user-123' } });
    });

    it('should return null if user not found', async () => {
      const result = await service.findOne('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findByKeycloakId', () => {
    it('should return a user by keycloak id', async () => {
      const result = await service.findByKeycloakId('kc-123');

      expect(result).toEqual(mockUser);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { keycloakId: 'kc-123' } });
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateData = { firstName: 'Updated' };
      const result = await service.update('user-123', updateData);

      expect(repository.update).toHaveBeenCalledWith('user-123', updateData);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 'user-123' } });
      expect(result).toEqual(mockUser);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      await service.remove('user-123');

      expect(repository.delete).toHaveBeenCalledWith('user-123');
    });
  });

  describe('findOrCreateFromKeycloak', () => {
    it('should create new user if not exists', async () => {
      const keycloakUser = {
        id: 'new-kc-id',
        email: 'new@example.com',
        firstName: 'New',
        lastName: 'User',
        username: 'newuser',
        roles: ['user'],
      };

      mockRepository.findOne.mockResolvedValueOnce(null);

      const result = await service.findOrCreateFromKeycloak(keycloakUser);

      expect(repository.create).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should update existing user', async () => {
      const keycloakUser = {
        id: 'kc-123',
        email: 'updated@example.com',
        firstName: 'Updated',
        lastName: 'User',
        username: 'updateduser',
        roles: ['user', 'admin'],
      };

      const result = await service.findOrCreateFromKeycloak(keycloakUser);

      expect(repository.update).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });
});
