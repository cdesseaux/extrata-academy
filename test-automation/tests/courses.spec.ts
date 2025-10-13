import { test, expect } from '@playwright/test';

const TEST_CREDENTIALS = {
  username: '73023990182',
  password: 'Dessis12!'
};

test.describe('Cursos', () => {
  test.beforeEach(async ({ page }) => {
    // Fazer login antes de cada teste
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[name="username"]', TEST_CREDENTIALS.username);
    await page.fill('input[name="password"]', TEST_CREDENTIALS.password);
    await page.click('input[type="submit"]');
    
    await page.waitForURL('**/dashboard');
  });

  test('deve listar cursos disponíveis', async ({ page }) => {
    await page.goto('/courses');
    
    // Aguardar carregamento dos cursos
    await page.waitForLoadState('networkidle');
    
    // Verificar se há cursos listados
    const courseCards = page.locator('[data-testid="course-card"], .course-card, .bg-white.rounded-lg');
    await expect(courseCards.first()).toBeVisible();
    
    // Verificar se não há mensagem de erro
    await expect(page.locator('text=Erro ao carregar cursos')).not.toBeVisible();
    await expect(page.locator('text=Nenhum curso disponível')).not.toBeVisible();
  });

  test('deve exibir detalhes de um curso', async ({ page }) => {
    await page.goto('/courses');
    await page.waitForLoadState('networkidle');
    
    // Clicar no primeiro curso
    const firstCourse = page.locator('[data-testid="course-card"], .course-card, .bg-white.rounded-lg').first();
    await firstCourse.click();
    
    // Verificar se foi redirecionado para a página do curso
    await page.waitForURL('**/courses/**');
    
    // Verificar elementos da página do curso
    await expect(page.locator('h2')).toBeVisible(); // Título do curso
    await expect(page.locator('text=Status da Matrícula, text=Informações do Curso')).toBeVisible();
  });

  test('deve mostrar botão de iniciar curso para usuário matriculado', async ({ page }) => {
    await page.goto('/courses');
    await page.waitForLoadState('networkidle');
    
    // Clicar no primeiro curso
    const firstCourse = page.locator('[data-testid="course-card"], .course-card, .bg-white.rounded-lg').first();
    await firstCourse.click();
    
    await page.waitForURL('**/courses/**');
    
    // Verificar se há botão de iniciar/continuar curso
    const startButton = page.locator('button:has-text("Iniciar Curso"), button:has-text("Continuar Curso")');
    await expect(startButton).toBeVisible();
  });

  test('deve navegar para a página de aprendizado', async ({ page }) => {
    await page.goto('/courses');
    await page.waitForLoadState('networkidle');
    
    // Clicar no primeiro curso
    const firstCourse = page.locator('[data-testid="course-card"], .course-card, .bg-white.rounded-lg').first();
    await firstCourse.click();
    
    await page.waitForURL('**/courses/**');
    
    // Clicar no botão de iniciar curso
    const startButton = page.locator('button:has-text("Iniciar Curso"), button:has-text("Continuar Curso")');
    await startButton.click();
    
    // Verificar se foi redirecionado para a página de aprendizado
    await page.waitForURL('**/learn');
    
    // Verificar elementos da página de aprendizado
    await expect(page.locator('text=Módulos, text=Lições')).toBeVisible();
  });

  test('deve exibir progresso do curso', async ({ page }) => {
    await page.goto('/courses');
    await page.waitForLoadState('networkidle');
    
    // Clicar no primeiro curso
    const firstCourse = page.locator('[data-testid="course-card"], .course-card, .bg-white.rounded-lg').first();
    await firstCourse.click();
    
    await page.waitForURL('**/courses/**');
    
    // Verificar se há informações de progresso
    await expect(page.locator('text=Progresso')).toBeVisible();
    await expect(page.locator('text=Matriculado em')).toBeVisible();
  });
});


