import { Controller, Get, Post, Body, Param, UseGuards, Request, UseInterceptors } from '@nestjs/common';
import { GamificationService } from './gamification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { XPTransactionType } from './entities/xp-transaction.entity';
import { HttpCacheInterceptor } from '../common/interceptors/cache.interceptor';
import { CacheService } from '../common/services/cache.service';

@Controller('gamification')
export class GamificationController {
  constructor(
    private readonly gamificationService: GamificationService,
    private readonly cacheService: CacheService,
  ) {}

  @Get('xp')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(HttpCacheInterceptor)
  async getUserXP(@Request() req: any) {
    return this.gamificationService.getUserXP(req.user.id);
  }

  @Get('xp-dev')
  async getUserXPDev() {
    // Rota temporária para desenvolvimento
    return { totalXP: 0, level: 1, xpToNextLevel: 100 };
  }

  @Get('achievements')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(HttpCacheInterceptor)
  async getUserAchievements(@Request() req: any) {
    return this.gamificationService.getUserAchievements(req.user.id);
  }

  @Get('achievements-dev')
  async getUserAchievementsDev() {
    // Rota temporária para desenvolvimento
    return [];
  }

  @Get('leaderboard')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(HttpCacheInterceptor)
  async getLeaderboard() {
    return this.gamificationService.getLeaderboard(10);
  }

  @Get('xp-history')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(HttpCacheInterceptor)
  async getXPHistory(@Request() req: any) {
    return this.gamificationService.getXPHistory(req.user.id, 20);
  }

  @Post('add-xp')
  @UseGuards(JwtAuthGuard)
  async addXP(
    @Request() req: any,
    @Body() body: { amount: number; type: XPTransactionType; description?: string; metadata?: any },
  ) {
    const result = await this.gamificationService.addXP(
      req.user.id,
      body.amount,
      body.type,
      body.description,
      body.metadata,
    );

    // Invalidate gamification caches
    await this.cacheService.invalidateGamification(req.user.id);

    return result;
  }

  @Post('update-streak')
  @UseGuards(JwtAuthGuard)
  async updateStreak(@Request() req: any) {
    await this.gamificationService.updateStreak(req.user.id);

    // Invalidate gamification caches
    await this.cacheService.invalidateGamification(req.user.id);

    return { message: 'Streak updated successfully' };
  }
}









