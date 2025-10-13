import { test, expect } from '@playwright/test';

const TEST_CREDENTIALS = {
  username: '73023990182',
  password: 'Dessis12!'
};

test.describe('Modo Escuro', () => {
  test.beforeEach(async ({ page }) => {
    // Fazer login antes de cada teste
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[name="username"]', TEST_CREDENTIALS.username);
    await page.fill('input[name="password"]', TEST_CREDENTIALS.password);
    await page.click('input[type="submit"]');
    
    await page.waitForURL('**/dashboard');
  });

  test('deve ter toggle de tema no dashboard', async ({ page }) => {
    // Verificar se há botão de toggle de tema
    const themeToggle = page.locator('[data-testid="theme-toggle"], button:has(svg)').first();
    await expect(themeToggle).toBeVisible();
  });

  test('deve alternar entre modo claro e escuro', async ({ page }) => {
    // Encontrar o toggle de tema
    const themeToggle = page.locator('[data-testid="theme-toggle"], button:has(svg)').first();
    
    // Verificar estado inicial
    const initialTheme = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark');
    });
    
    // Clicar no toggle
    await themeToggle.click();
    
    // Aguardar transição
    await page.waitForTimeout(500);
    
    // Verificar se o tema mudou
    const newTheme = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark');
    });
    
    expect(newTheme).not.toBe(initialTheme);
  });

  test('deve aplicar modo escuro corretamente', async ({ page }) => {
    // Ativar modo escuro
    const themeToggle = page.locator('[data-testid="theme-toggle"], button:has(svg)').first();
    await themeToggle.click();
    
    await page.waitForTimeout(500);
    
    // Verificar se o HTML tem a classe dark
    const hasDarkClass = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark');
    });
    
    expect(hasDarkClass).toBe(true);
    
    // Verificar se os elementos têm cores escuras
    const body = page.locator('body');
    const backgroundColor = await body.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    
    // Verificar se a cor de fundo é escura
    expect(backgroundColor).toMatch(/rgb\(10, 10, 10\)|rgb\(26, 26, 26\)|#0a0a0a|#1a1a1a/);
  });

  test('deve manter tema ao navegar entre páginas', async ({ page }) => {
    // Ativar modo escuro
    const themeToggle = page.locator('[data-testid="theme-toggle"], button:has(svg)').first();
    await themeToggle.click();
    
    await page.waitForTimeout(500);
    
    // Navegar para outra página
    await page.goto('/courses');
    await page.waitForLoadState('networkidle');
    
    // Verificar se o modo escuro foi mantido
    const hasDarkClass = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark');
    });
    
    expect(hasDarkClass).toBe(true);
  });

  test('deve ter toggle de tema em todas as páginas', async ({ page }) => {
    const pages = ['/dashboard', '/courses'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      
      // Verificar se há toggle de tema
      const themeToggle = page.locator('[data-testid="theme-toggle"], button:has(svg)').first();
      await expect(themeToggle).toBeVisible();
    }
  });

  test('deve aplicar transições suaves', async ({ page }) => {
    // Verificar se há transições CSS
    const body = page.locator('body');
    const transition = await body.evaluate((el) => {
      return window.getComputedStyle(el).transition;
    });
    
    // Verificar se há transições configuradas
    expect(transition).toContain('background-color') || expect(transition).toContain('color');
  });
});


