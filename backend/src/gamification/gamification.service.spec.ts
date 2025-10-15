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

  describe('addXP with level up', () => {
    it('should trigger level up when XP threshold is reached', async () => {
      const userNearLevelUp = {
        ...mockUserXP,
        currentLevelXP: 450,
        nextLevelXP: 500,
        level: 5,
      };
      mockUserXPRepository.findOne.mockResolvedValue(userNearLevelUp);
      mockAchievementRepository.find.mockResolvedValue([]);
      mockUserAchievementRepository.find.mockResolvedValue([]);

      const result = await service.addXP('user-123', 100, XPTransactionType.LESSON_COMPLETED);

      expect(result.levelUp).toBe(true);
      expect(result.newLevel).toBe(6);
      expect(userXPRepository.save).toHaveBeenCalled();
    });

    it('should not level up when XP threshold is not reached', async () => {
      const userNotNearLevelUp = {
        ...mockUserXP,
        currentLevelXP: 100,
        nextLevelXP: 500,
        level: 5,
      };
      mockUserXPRepository.findOne.mockResolvedValue(userNotNearLevelUp);
      mockAchievementRepository.find.mockResolvedValue([]);
      mockUserAchievementRepository.find.mockResolvedValue([]);

      const result = await service.addXP('user-123', 50, XPTransactionType.LESSON_COMPLETED);

      expect(result.levelUp).toBe(false);
      expect(result.newLevel).toBeUndefined();
    });

    it('should handle multiple level ups with large XP gain', async () => {
      const userAtLevel1 = {
        ...mockUserXP,
        currentLevelXP: 90,
        nextLevelXP: 100,
        level: 1,
      };
      mockUserXPRepository.findOne.mockResolvedValue(userAtLevel1);
      mockAchievementRepository.find.mockResolvedValue([]);
      mockUserAchievementRepository.find.mockResolvedValue([]);

      // Adding 500 XP should cause multiple level ups
      const result = await service.addXP('user-123', 500, XPTransactionType.COURSE_COMPLETED);

      expect(result.levelUp).toBe(true);
      expect(result.newLevel).toBeGreaterThan(1);
    });
  });

  describe('updateStreak', () => {
    it('should initialize streak for first time user', async () => {
      const userWithNoStreak = {
        ...mockUserXP,
        lastActivityDate: null,
        streak: 0,
      };
      mockUserXPRepository.findOne.mockResolvedValue(userWithNoStreak);

      await service.updateStreak('user-123');

      expect(userXPRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          streak: 1,
        }),
      );
    });

    it('should increment streak for consecutive day', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const userWithStreak = {
        ...mockUserXP,
        lastActivityDate: yesterday,
        streak: 5,
      };
      mockUserXPRepository.findOne.mockResolvedValue(userWithStreak);

      await service.updateStreak('user-123');

      expect(userXPRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          streak: 6,
        }),
      );
    });

    it('should reset streak if more than one day missed', async () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      threeDaysAgo.setHours(0, 0, 0, 0);

      const userWithBrokenStreak = {
        ...mockUserXP,
        lastActivityDate: threeDaysAgo,
        streak: 10,
      };
      mockUserXPRepository.findOne.mockResolvedValue(userWithBrokenStreak);

      await service.updateStreak('user-123');

      expect(userXPRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          streak: 1,
        }),
      );
    });

    it('should not change streak if already updated today', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const userUpdatedToday = {
        ...mockUserXP,
        lastActivityDate: today,
        streak: 5,
      };
      mockUserXPRepository.findOne.mockResolvedValue(userUpdatedToday);

      await service.updateStreak('user-123');

      // Streak should remain the same
      expect(userXPRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          streak: 5,
        }),
      );
    });
  });

  describe('getUserAchievements', () => {
    it('should return user achievements ordered by unlock date', async () => {
      const mockUserAchievements = [
        { id: '1', userId: 'user-123', achievementId: 'ach-1', unlockedAt: new Date() },
        { id: '2', userId: 'user-123', achievementId: 'ach-2', unlockedAt: new Date() },
      ];
      mockUserAchievementRepository.find.mockResolvedValue(mockUserAchievements);

      const result = await service.getUserAchievements('user-123');

      expect(userAchievementRepository.find).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        relations: ['achievement'],
        order: { unlockedAt: 'DESC' },
      });
      expect(result).toEqual(mockUserAchievements);
    });
  });

  describe('getXPHistory', () => {
    it('should return XP transaction history with default limit', async () => {
      const mockTransactions = [mockXPTransaction];
      mockXPTransactionRepository.find.mockResolvedValue(mockTransactions);

      const result = await service.getXPHistory('user-123');

      expect(xpTransactionRepository.find).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        order: { createdAt: 'DESC' },
        take: 20,
      });
      expect(result).toEqual(mockTransactions);
    });

    it('should return XP transaction history with custom limit', async () => {
      const mockTransactions = [mockXPTransaction];
      mockXPTransactionRepository.find.mockResolvedValue(mockTransactions);

      const result = await service.getXPHistory('user-123', 50);

      expect(xpTransactionRepository.find).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        order: { createdAt: 'DESC' },
        take: 50,
      });
      expect(result).toEqual(mockTransactions);
    });
  });
});
