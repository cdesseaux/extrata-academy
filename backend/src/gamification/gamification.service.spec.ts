import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GamificationService } from './gamification.service';
import { UserXP } from './entities/user-xp.entity';
import { XPTransaction, XPTransactionType } from './entities/xp-transaction.entity';
import { Achievement } from './entities/achievement.entity';
import { UserAchievement } from './entities/user-achievement.entity';

describe('GamificationService', () => {
  let service: GamificationService;
  let userXPRepository: Repository<UserXP>;
  let xpTransactionRepository: Repository<XPTransaction>;
  let achievementRepository: Repository<Achievement>;
  let userAchievementRepository: Repository<UserAchievement>;

  const mockUserXP = {
    id: 'userxp-123',
    userId: 'user-123',
    totalXP: 1000,
    level: 5,
    currentLevelXP: 250,
    nextLevelXP: 500,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockXPTransaction = {
    id: 'transaction-123',
    userId: 'user-123',
    amount: 50,
    type: XPTransactionType.LESSON_COMPLETED,
    description: 'Completed lesson',
    createdAt: new Date(),
  };

  const mockAchievement = {
    id: 'achievement-123',
    key: 'first_course',
    name: 'First Steps',
    description: 'Complete your first course',
    icon: '🎓',
    xpReward: 100,
    criteria: { coursesCompleted: 1 },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserXPRepository = {
    findOne: jest.fn(),
    find: jest.fn(() => Promise.resolve([mockUserXP])),
    create: jest.fn((dto) => dto),
    save: jest.fn((entity) => Promise.resolve({ ...mockUserXP, ...entity })),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([mockUserXP]),
    })),
  };

  const mockXPTransactionRepository = {
    create: jest.fn((dto) => dto),
    save: jest.fn((entity) => Promise.resolve({ ...mockXPTransaction, ...entity })),
    find: jest.fn(() => Promise.resolve([mockXPTransaction])),
  };

  const mockAchievementRepository = {
    find: jest.fn(() => Promise.resolve([mockAchievement])),
    findOne: jest.fn(() => Promise.resolve(mockAchievement)),
  };

  const mockUserAchievementRepository = {
    findOne: jest.fn(),
    create: jest.fn((dto) => dto),
    save: jest.fn((entity) => Promise.resolve(entity)),
    find: jest.fn(() => Promise.resolve([])),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GamificationService,
        {
          provide: getRepositoryToken(UserXP),
          useValue: mockUserXPRepository,
        },
        {
          provide: getRepositoryToken(XPTransaction),
          useValue: mockXPTransactionRepository,
        },
        {
          provide: getRepositoryToken(Achievement),
          useValue: mockAchievementRepository,
        },
        {
          provide: getRepositoryToken(UserAchievement),
          useValue: mockUserAchievementRepository,
        },
      ],
    }).compile();

    service = module.get<GamificationService>(GamificationService);
    userXPRepository = module.get<Repository<UserXP>>(getRepositoryToken(UserXP));
    xpTransactionRepository = module.get<Repository<XPTransaction>>(getRepositoryToken(XPTransaction));
    achievementRepository = module.get<Repository<Achievement>>(getRepositoryToken(Achievement));
    userAchievementRepository = module.get<Repository<UserAchievement>>(getRepositoryToken(UserAchievement));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addXP', () => {
    it('should add XP to existing user', async () => {
      mockUserXPRepository.findOne.mockResolvedValue(mockUserXP);

      await service.addXP('user-123', 50, XPTransactionType.LESSON_COMPLETED, 'Test');

      expect(userXPRepository.findOne).toHaveBeenCalled();
      expect(xpTransactionRepository.create).toHaveBeenCalled();
      expect(xpTransactionRepository.save).toHaveBeenCalled();
      expect(userXPRepository.save).toHaveBeenCalled();
    });

    it('should create new UserXP if user does not exist', async () => {
      mockUserXPRepository.findOne.mockResolvedValue(null);

      await service.addXP('user-new', 50, XPTransactionType.LESSON_COMPLETED, 'Test');

      expect(userXPRepository.create).toHaveBeenCalled();
      expect(userXPRepository.save).toHaveBeenCalled();
    });
  });

  describe('getUserXP', () => {
    it('should return user XP data', async () => {
      mockUserXPRepository.findOne.mockResolvedValue(mockUserXP);

      const result = await service.getUserXP('user-123');

      expect(result).toEqual(mockUserXP);
      expect(userXPRepository.findOne).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
      });
    });

    it('should create new UserXP if user not found', async () => {
      mockUserXPRepository.findOne.mockResolvedValue(null);

      const result = await service.getUserXP('user-new');

      expect(userXPRepository.create).toHaveBeenCalled();
      expect(userXPRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('getLeaderboard', () => {
    it('should return leaderboard data', async () => {
      const result = await service.getLeaderboard(10);

      expect(result).toEqual([mockUserXP]);
      expect(userXPRepository.find).toHaveBeenCalled();
    });
  });

  describe('checkAchievements', () => {
    it('should check achievements for user', async () => {
      mockAchievementRepository.find.mockResolvedValue([mockAchievement]);
      mockUserAchievementRepository.find.mockResolvedValue([]);
      mockUserXPRepository.findOne.mockResolvedValue(mockUserXP);

      const result = await service.checkAchievements('user-123');

      expect(achievementRepository.find).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });
});
