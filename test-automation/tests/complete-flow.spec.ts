import { test, expect } from '@playwright/test';

const TEST_CREDENTIALS = {
  username: '73023990182',
  password: 'Dessis12!'
};

test.describe('Fluxo Completo do Sistema', () => {
  test('deve executar fluxo completo: login -> cursos -> quiz -> gamificação', async ({ page }) => {
    // 1. Login
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[name="username"]', TEST_CREDENTIALS.username);
    await page.fill('input[name="password"]', TEST_CREDENTIALS.password);
    await page.click('input[type="submit"]');
    
    await page.waitForURL('**/dashboard');
    await expect(page.locator('text=Olá, Christophe')).toBeVisible();
    
    // 2. Verificar gamificação no dashboard
    await expect(page.locator('text=XP, text=Pontos')).toBeVisible();
    
    // 3. Navegar para cursos
    await page.goto('/courses');
    await page.waitForLoadState('networkidle');
    
    // Verificar se há cursos
    const courseCards = page.locator('[data-testid="course-card"], .course-card, .bg-white.rounded-lg');
    await expect(courseCards.first()).toBeVisible();
    
    // 4. Acessar um curso
    await courseCards.first().click();
    await page.waitForURL('**/courses/**');
    
    // Verificar página do curso
    await expect(page.locator('h2')).toBeVisible();
    
    // 5. Iniciar curso
    const startButton = page.locator('button:has-text("Iniciar Curso"), button:has-text("Continuar Curso")');
    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForURL('**/learn');
      
      // Verificar página de aprendizado
      await expect(page.locator('text=Módulos, text=Lições')).toBeVisible();
    }
    
    // 6. Testar modo escuro
    await page.goto('/dashboard');
    const themeToggle = page.locator('[data-testid="theme-toggle"], button:has(svg)').first();
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      await page.waitForTimeout(500);
      
      const hasDarkClass = await page.evaluate(() => {
        return document.documentElement.classList.contains('dark');
      });
      expect(hasDarkClass).toBe(true);
    }
    
    // 7. Testar gamificação
    const addXPButton = page.locator('button:has-text("+100 XP")');
    if (await addXPButton.isVisible()) {
      await addXPButton.click();
      await expect(page.locator('text=+100 XP, text=XP adicionado')).toBeVisible();
    }
  });

  test('deve testar responsividade em diferentes dispositivos', async ({ page }) => {
    // Fazer login
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[name="username"]', TEST_CREDENTIALS.username);
    await page.fill('input[name="password"]', TEST_CREDENTIALS.password);
    await page.click('input[type="submit"]');
    
    await page.waitForURL('**/dashboard');
    
    // Testar diferentes tamanhos de tela
    const viewports = [
      { width: 1920, height: 1080, name: 'Desktop' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 375, height: 667, name: 'Mobile' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      // Verificar se o layout se adapta
      await expect(page.locator('text=Dashboard')).toBeVisible();
      
      // Verificar se não há overflow horizontal
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = viewport.width;
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20); // Margem de erro
    }
  });

  test('deve testar todas as funcionalidades principais', async ({ page }) => {
    // Login
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[name="username"]', TEST_CREDENTIALS.username);
    await page.fill('input[name="password"]', TEST_CREDENTIALS.password);
    await page.click('input[type="submit"]');
    
    await page.waitForURL('**/dashboard');
    
    // Lista de funcionalidades para testar
    const features = [
      { name: 'Dashboard', url: '/dashboard', elements: ['text=Dashboard', 'text=XP'] },
      { name: 'Cursos', url: '/courses', elements: ['text=Cursos', '[data-testid="course-card"], .course-card'] },
    ];
    
    for (const feature of features) {
      await page.goto(feature.url);
      await page.waitForLoadState('networkidle');
      
      // Verificar elementos específicos
      for (const element of feature.elements) {
        await expect(page.locator(element).first()).toBeVisible();
      }
      
      console.log(`✅ ${feature.name} funcionando corretamente`);
    }
  });

  test('deve gerar relatório de status do sistema', async ({ page }) => {
    const report = {
      timestamp: new Date().toISOString(),
      tests: [] as any[]
    };
    
    // Teste de conectividade
    try {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      report.tests.push({ name: 'Conectividade Frontend', status: 'PASS' });
    } catch (error) {
      report.tests.push({ name: 'Conectividade Frontend', status: 'FAIL', error: error.message });
    }
    
    // Teste de autenticação
    try {
      await page.fill('input[name="username"]', TEST_CREDENTIALS.username);
      await page.fill('input[name="password"]', TEST_CREDENTIALS.password);
      await page.click('input[type="submit"]');
      await page.waitForURL('**/dashboard');
      report.tests.push({ name: 'Autenticação', status: 'PASS' });
    } catch (error) {
      report.tests.push({ name: 'Autenticação', status: 'FAIL', error: error.message });
    }
    
    // Teste de API
    try {
      const response = await page.request.get('/api/courses');
      report.tests.push({ name: 'API Cursos', status: response.status() === 200 ? 'PASS' : 'FAIL' });
    } catch (error) {
      report.tests.push({ name: 'API Cursos', status: 'FAIL', error: error.message });
    }
    
    // Salvar relatório
    console.log('📊 Relatório de Status do Sistema:');
    console.log(JSON.stringify(report, null, 2));
    
    // Verificar se pelo menos 80% dos testes passaram
    const passedTests = report.tests.filter(t => t.status === 'PASS').length;
    const totalTests = report.tests.length;
    const passRate = (passedTests / totalTests) * 100;
    
    expect(passRate).toBeGreaterThanOrEqual(80);
  });
});


