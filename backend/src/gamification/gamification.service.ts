import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserXP } from './entities/user-xp.entity';
import { Achievement } from './entities/achievement.entity';
import { UserAchievement } from './entities/user-achievement.entity';
import { XPTransaction, XPTransactionType } from './entities/xp-transaction.entity';
import { AchievementType } from './entities/achievement.entity';

@Injectable()
export class GamificationService {
  constructor(
    @InjectRepository(UserXP)
    private userXPRepository: Repository<UserXP>,
    @InjectRepository(Achievement)
    private achievementRepository: Repository<Achievement>,
    @InjectRepository(UserAchievement)
    private userAchievementRepository: Repository<UserAchievement>,
    @InjectRepository(XPTransaction)
    private xpTransactionRepository: Repository<XPTransaction>,
  ) {}

  // XP e Níveis
  async getUserXP(userId: string): Promise<UserXP> {
    let userXP = await this.userXPRepository.findOne({ where: { userId } });
    
    if (!userXP) {
      userXP = this.userXPRepository.create({
        userId,
        totalXP: 0,
        level: 1,
        currentLevelXP: 0,
        nextLevelXP: 100,
        streak: 0,
      });
      await this.userXPRepository.save(userXP);
    }
    
    return userXP;
  }

  async addXP(
    userId: string,
    amount: number,
    type: XPTransactionType,
    description?: string,
    metadata?: any,
  ): Promise<{ userXP: UserXP; levelUp: boolean; newLevel?: number }> {
    const userXP = await this.getUserXP(userId);
    
    // Criar transação
    const transaction = this.xpTransactionRepository.create({
      userId,
      type,
      amount,
      description,
      metadata,
    });
    await this.xpTransactionRepository.save(transaction);

    // Atualizar XP
    const oldLevel = userXP.level;
    userXP.totalXP += amount;
    userXP.currentLevelXP += amount;

    // Verificar se subiu de nível
    let levelUp = false;
    let newLevel = oldLevel;

    while (userXP.currentLevelXP >= userXP.nextLevelXP) {
      userXP.currentLevelXP -= userXP.nextLevelXP;
      userXP.level += 1;
      userXP.nextLevelXP = this.calculateNextLevelXP(userXP.level);
      levelUp = true;
      newLevel = userXP.level;
    }

    await this.userXPRepository.save(userXP);

    // Verificar achievements
    await this.checkAchievements(userId);

    return { userXP, levelUp, newLevel: levelUp ? newLevel : undefined };
  }

  private calculateNextLevelXP(level: number): number {
    // Fórmula: 100 * (level ^ 1.5)
    return Math.floor(100 * Math.pow(level, 1.5));
  }

  async updateStreak(userId: string): Promise<void> {
    const userXP = await this.getUserXP(userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!userXP.lastActivityDate) {
      userXP.streak = 1;
    } else {
      const lastActivity = new Date(userXP.lastActivityDate);
      lastActivity.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        userXP.streak += 1;
      } else if (daysDiff > 1) {
        userXP.streak = 1;
      }
    }

    userXP.lastActivityDate = today;
    await this.userXPRepository.save(userXP);
  }

  // Achievements
  async checkAchievements(userId: string): Promise<UserAchievement[]> {
    const userXP = await this.getUserXP(userId);
    const userAchievements = await this.userAchievementRepository.find({
      where: { userId },
      relations: ['achievement'],
    });

    const unlockedAchievements: UserAchievement[] = [];
    const achievements = await this.achievementRepository.find({ where: { isActive: true } });

    for (const achievement of achievements) {
      const alreadyUnlocked = userAchievements.some(ua => ua.achievementId === achievement.id);
      
      if (!alreadyUnlocked && await this.isAchievementUnlocked(userId, achievement, userXP)) {
        const userAchievement = this.userAchievementRepository.create({
          userId,
          achievementId: achievement.id,
          unlockedAt: new Date(),
        });
        
        await this.userAchievementRepository.save(userAchievement);
        
        // Adicionar XP do achievement
        if (achievement.xpReward > 0) {
          await this.addXP(
            userId,
            achievement.xpReward,
            XPTransactionType.ACHIEVEMENT_UNLOCKED,
            `Achievement: ${achievement.name}`,
            { achievementId: achievement.id },
          );
        }
        
        unlockedAchievements.push(userAchievement);
      }
    }

    return unlockedAchievements;
  }

  private async isAchievementUnlocked(userId: string, achievement: Achievement, userXP: UserXP): Promise<boolean> {
    switch (achievement.type) {
      case AchievementType.COURSE_COMPLETED:
        // Verificar se completou pelo menos 1 curso
        return userXP.totalXP >= 500; // Assumindo que completar curso dá 500 XP
      
      case AchievementType.STREAK_7_DAYS:
        return userXP.streak >= 7;
      
      case AchievementType.STREAK_30_DAYS:
        return userXP.streak >= 30;
      
      case AchievementType.EXPERT:
        return userXP.level >= 10;
      
      case AchievementType.MASTER:
        return userXP.level >= 20;
      
      default:
        return false;
    }
  }

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    return this.userAchievementRepository.find({
      where: { userId },
      relations: ['achievement'],
      order: { unlockedAt: 'DESC' },
    });
  }

  async getLeaderboard(limit: number = 10): Promise<UserXP[]> {
    return this.userXPRepository.find({
      order: { totalXP: 'DESC' },
      take: limit,
      relations: ['user'],
    });
  }

  async getXPHistory(userId: string, limit: number = 20): Promise<XPTransaction[]> {
    return this.xpTransactionRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
