import { Test, TestingModule } from '@nestjs/testing';
import { GamificationController } from './gamification.controller';
import { GamificationService } from './gamification.service';

describe('GamificationController', () => {
  let controller: GamificationController;
  let service: GamificationService;

  const mockUserXP = {
    id: 'userxp-123',
    userId: 'user-123',
    totalXP: 1500,
    level: 7,
    currentLevelXP: 300,
    nextLevelXP: 700,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAchievement = {
    id: 'achievement-123',
    userId: 'user-123',
    achievementId: 'ach-123',
    unlockedAt: new Date(),
    createdAt: new Date(),
  };

  const mockRequest = {
    user: { id: 'user-123', email: 'test@example.com' },
  };

  const mockGamificationService = {
    getUserXP: jest.fn().mockResolvedValue(mockUserXP),
    getLeaderboard: jest.fn().mockResolvedValue([mockUserXP]),
    getUserAchievements: jest.fn().mockResolvedValue([mockAchievement]),
    checkAchievements: jest.fn().mockResolvedValue([mockAchievement]),
    getXPHistory: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GamificationController],
      providers: [
        {
          provide: GamificationService,
          useValue: mockGamificationService,
        },
      ],
    }).compile();

    controller = module.get<GamificationController>(GamificationController);
    service = module.get<GamificationService>(GamificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUserXP', () => {
    it('should return user XP data', async () => {
      const result = await controller.getUserXP(mockRequest as any);

      expect(service.getUserXP).toHaveBeenCalledWith('user-123');
      expect(result).toEqual(mockUserXP);
    });
  });

  describe('getLeaderboard', () => {
    it('should return leaderboard', async () => {
      const result = await controller.getLeaderboard();

      expect(service.getLeaderboard).toHaveBeenCalledWith(10);
      expect(result).toEqual([mockUserXP]);
    });
  });

  describe('getUserAchievements', () => {
    it('should return user achievements', async () => {
      const result = await controller.getUserAchievements(mockRequest as any);

      expect(service.getUserAchievements).toHaveBeenCalledWith('user-123');
      expect(result).toEqual([mockAchievement]);
    });
  });

  describe('getXPHistory', () => {
    it('should return user XP history', async () => {
      const result = await controller.getXPHistory(mockRequest as any);

      expect(service.getXPHistory).toHaveBeenCalledWith('user-123', 20);
      expect(result).toBeDefined();
    });
  });
});
