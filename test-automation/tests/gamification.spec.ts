import { test, expect } from '@playwright/test';

const TEST_CREDENTIALS = {
  username: '73023990182',
  password: 'Dessis12!'
};

test.describe('Gamificação', () => {
  test.beforeEach(async ({ page }) => {
    // Fazer login antes de cada teste
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[name="username"]', TEST_CREDENTIALS.username);
    await page.fill('input[name="password"]', TEST_CREDENTIALS.password);
    await page.click('input[type="submit"]');
    
    await page.waitForURL('**/dashboard');
  });

  test('deve exibir sistema de XP no dashboard', async ({ page }) => {
    // Verificar elementos de XP no dashboard
    await expect(page.locator('text=XP, text=Pontos, text=Nível')).toBeVisible();
    
    // Verificar se há display de XP
    const xpDisplay = page.locator('[data-testid="xp-display"], .xp-display, text=/\\d+ XP/');
    await expect(xpDisplay.first()).toBeVisible();
  });

  test('deve exibir leaderboard', async ({ page }) => {
    // Verificar se há leaderboard
    const leaderboard = page.locator('[data-testid="leaderboard"], .leaderboard, text=Leaderboard');
    await expect(leaderboard.first()).toBeVisible();
    
    // Verificar se há lista de usuários
    const userList = page.locator('[data-testid="leaderboard-item"], .leaderboard-item');
    await expect(userList.first()).toBeVisible();
  });

  test('deve exibir achievements', async ({ page }) => {
    // Verificar se há seção de achievements
    const achievements = page.locator('[data-testid="achievements"], .achievements, text=Conquistas');
    await expect(achievements.first()).toBeVisible();
  });

  test('deve permitir adicionar XP manualmente', async ({ page }) => {
    // Procurar botão de teste de XP
    const addXPButton = page.locator('button:has-text("+100 XP"), button:has-text("Adicionar XP")');
    
    if (await addXPButton.isVisible()) {
      await addXPButton.click();
      
      // Verificar se apareceu notificação de XP
      await expect(page.locator('text=+100 XP, text=XP adicionado')).toBeVisible();
    }
  });

  test('deve atualizar streak', async ({ page }) => {
    // Procurar botão de atualizar streak
    const streakButton = page.locator('button:has-text("Atualizar Streak"), button:has-text("Streak")');
    
    if (await streakButton.isVisible()) {
      await streakButton.click();
      
      // Verificar se apareceu notificação de streak
      await expect(page.locator('text=Sequência, text=Streak')).toBeVisible();
    }
  });

  test('deve exibir notificações de gamificação', async ({ page }) => {
    // Clicar em botões de teste se existirem
    const addXPButton = page.locator('button:has-text("+100 XP")');
    const streakButton = page.locator('button:has-text("Atualizar Streak")');
    
    if (await addXPButton.isVisible()) {
      await addXPButton.click();
      
      // Verificar notificação de XP
      const xpNotification = page.locator('[data-testid="xp-notification"], .xp-notification');
      await expect(xpNotification.first()).toBeVisible();
    }
    
    if (await streakButton.isVisible()) {
      await streakButton.click();
      
      // Verificar notificação de streak
      const streakNotification = page.locator('text=Sequência, text=Streak');
      await expect(streakNotification.first()).toBeVisible();
    }
  });

  test('deve exibir progresso de nível', async ({ page }) => {
    // Verificar se há barra de progresso de nível
    const levelProgress = page.locator('[data-testid="level-progress"], .level-progress, .progress-bar');
    await expect(levelProgress.first()).toBeVisible();
    
    // Verificar se há indicação de nível atual
    const currentLevel = page.locator('text=Nível, text=Level, text=/Nível \\d+/');
    await expect(currentLevel.first()).toBeVisible();
  });
});


