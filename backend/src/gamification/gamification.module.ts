import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GamificationService } from './gamification.service';
import { GamificationController } from './gamification.controller';
import { UserXP } from './entities/user-xp.entity';
import { Achievement } from './entities/achievement.entity';
import { UserAchievement } from './entities/user-achievement.entity';
import { XPTransaction } from './entities/xp-transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserXP, Achievement, UserAchievement, XPTransaction]),
  ],
  providers: [GamificationService],
  controllers: [GamificationController],
  exports: [GamificationService],
})
export class GamificationModule {}







