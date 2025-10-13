import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { GamificationService } from '../gamification/gamification.service';
import { AchievementType } from '../gamification/entities/achievement.entity';
import { INestApplicationContext } from '@nestjs/common';

async function bootstrap() {
  let app: INestApplicationContext | undefined;
  try {
    app = await NestFactory.createApplicationContext(AppModule);
    const gamificationService = app.get(GamificationService);

    console.log('🏆 Iniciando seed de achievements...');

    const achievementsToSeed = [
      {
        code: 'first_course',
        name: 'Primeiro Passo',
        description: 'Complete seu primeiro curso',
        icon: '🎯',
        type: AchievementType.COURSE_COMPLETED,
        xpReward: 100,
        criteria: { coursesCompleted: 1 },
      },
      {
        code: 'streak_7',
        name: 'Consistência',
        description: 'Mantenha uma sequência de 7 dias',
        icon: '🔥',
        type: AchievementType.STREAK_7_DAYS,
        xpReward: 200,
        criteria: { streakDays: 7 },
      },
      {
        code: 'streak_30',
        name: 'Dedicação',
        description: 'Mantenha uma sequência de 30 dias',
        icon: '💪',
        type: AchievementType.STREAK_30_DAYS,
        xpReward: 500,
        criteria: { streakDays: 30 },
      },
      {
        code: 'first_quiz',
        name: 'Primeiro Quiz',
        description: 'Complete seu primeiro quiz',
        icon: '🧠',
        type: AchievementType.FIRST_QUIZ,
        xpReward: 50,
        criteria: { quizzesCompleted: 1 },
      },
      {
        code: 'perfect_quiz',
        name: 'Perfeição',
        description: 'Acerte 100% em um quiz',
        icon: '⭐',
        type: AchievementType.PERFECT_QUIZ,
        xpReward: 150,
        criteria: { perfectScore: true },
      },
      {
        code: 'early_bird',
        name: 'Madrugador',
        description: 'Complete uma lição antes das 6h',
        icon: '🌅',
        type: AchievementType.EARLY_BIRD,
        xpReward: 75,
        criteria: { earlyHour: 6 },
      },
      {
        code: 'speed_learner',
        name: 'Aprendiz Rápido',
        description: 'Complete um curso em menos de 1 dia',
        icon: '⚡',
        type: AchievementType.SPEED_LEARNER,
        xpReward: 300,
        criteria: { completionTime: '1day' },
      },
      {
        code: 'dedicated',
        name: 'Dedicado',
        description: 'Complete 10 cursos',
        icon: '📚',
        type: AchievementType.DEDICATED,
        xpReward: 1000,
        criteria: { coursesCompleted: 10 },
      },
      {
        code: 'expert',
        name: 'Especialista',
        description: 'Alcance o nível 10',
        icon: '🎓',
        type: AchievementType.EXPERT,
        xpReward: 500,
        criteria: { level: 10 },
      },
      {
        code: 'master',
        name: 'Mestre',
        description: 'Alcance o nível 20',
        icon: '👑',
        type: AchievementType.MASTER,
        xpReward: 1000,
        criteria: { level: 20 },
      },
    ];

    for (const achievementData of achievementsToSeed) {
      try {
        // Verificar se já existe
        const existing = await gamificationService['achievementRepository'].findOne({
          where: { code: achievementData.code },
        });

        if (existing) {
          console.log(`⏭️  Achievement já existe: ${achievementData.name}`);
        } else {
          await gamificationService['achievementRepository'].save(achievementData);
          console.log(`✅ Achievement criado: ${achievementData.name}`);
        }
      } catch (error) {
        console.error(`❌ Erro ao criar achievement ${achievementData.name}:`, error);
      }
    }

    console.log('🎉 Seed de achievements concluído!');
  } catch (error) {
    console.error('❌ Erro durante o seed de achievements:', error);
  } finally {
    await app?.close();
  }
}

bootstrap();
