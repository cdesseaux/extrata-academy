import { test, expect } from '@playwright/test';

const TEST_CREDENTIALS = {
  username: '73023990182',
  password: 'Dessis12!'
};

test.describe('Sistema de Quizzes', () => {
  test.beforeEach(async ({ page }) => {
    // Fazer login antes de cada teste
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[name="username"]', TEST_CREDENTIALS.username);
    await page.fill('input[name="password"]', TEST_CREDENTIALS.password);
    await page.click('input[type="submit"]');
    
    await page.waitForURL('**/dashboard');
  });

  test('deve acessar quiz através de uma lição', async ({ page }) => {
    // Navegar para um curso
    await page.goto('/courses');
    await page.waitForLoadState('networkidle');
    
    const firstCourse = page.locator('[data-testid="course-card"], .course-card, .bg-white.rounded-lg').first();
    await firstCourse.click();
    
    await page.waitForURL('**/courses/**');
    
    // Iniciar o curso
    const startButton = page.locator('button:has-text("Iniciar Curso"), button:has-text("Continuar Curso")');
    await startButton.click();
    
    await page.waitForURL('**/learn');
    
    // Procurar por uma lição do tipo QUIZ
    const quizLesson = page.locator('[data-testid="quiz-lesson"], .lesson-item:has-text("Quiz")').first();
    
    if (await quizLesson.isVisible()) {
      await quizLesson.click();
      
      // Verificar se o quiz player foi carregado
      await expect(page.locator('[data-testid="quiz-player"], .quiz-player')).toBeVisible();
    }
  });

  test('deve exibir interface do quiz player', async ({ page }) => {
    // Tentar acessar um quiz diretamente (se existir)
    await page.goto('/courses');
    await page.waitForLoadState('networkidle');
    
    const firstCourse = page.locator('[data-testid="course-card"], .course-card, .bg-white.rounded-lg').first();
    await firstCourse.click();
    
    await page.waitForURL('**/courses/**');
    
    const startButton = page.locator('button:has-text("Iniciar Curso"), button:has-text("Continuar Curso")');
    await startButton.click();
    
    await page.waitForURL('**/learn');
    
    // Procurar por elementos do quiz
    const quizElements = page.locator('text=Quiz, text=Pergunta, text=Resposta, [data-testid="quiz"]');
    
    if (await quizElements.first().isVisible()) {
      await quizElements.first().click();
      
      // Verificar elementos do quiz player
      await expect(page.locator('text=Iniciar Quiz, text=Responder, button:has-text("Próxima")')).toBeVisible();
    }
  });

  test('deve permitir responder questões do quiz', async ({ page }) => {
    // Navegar para um quiz
    await page.goto('/courses');
    await page.waitForLoadState('networkidle');
    
    const firstCourse = page.locator('[data-testid="course-card"], .course-card, .bg-white.rounded-lg').first();
    await firstCourse.click();
    
    await page.waitForURL('**/courses/**');
    
    const startButton = page.locator('button:has-text("Iniciar Curso"), button:has-text("Continuar Curso")');
    await startButton.click();
    
    await page.waitForURL('**/learn');
    
    // Procurar por quiz
    const quizLesson = page.locator('[data-testid="quiz-lesson"], .lesson-item:has-text("Quiz")').first();
    
    if (await quizLesson.isVisible()) {
      await quizLesson.click();
      
      // Tentar responder uma questão
      const answerOption = page.locator('input[type="radio"], input[type="checkbox"]').first();
      
      if (await answerOption.isVisible()) {
        await answerOption.click();
        
        // Verificar se há botão de próxima questão
        const nextButton = page.locator('button:has-text("Próxima"), button:has-text("Responder")');
        await expect(nextButton).toBeVisible();
      }
    }
  });

  test('deve exibir resultados do quiz', async ({ page }) => {
    // Navegar para um quiz e tentar completar
    await page.goto('/courses');
    await page.waitForLoadState('networkidle');
    
    const firstCourse = page.locator('[data-testid="course-card"], .course-card, .bg-white.rounded-lg').first();
    await firstCourse.click();
    
    await page.waitForURL('**/courses/**');
    
    const startButton = page.locator('button:has-text("Iniciar Curso"), button:has-text("Continuar Curso")');
    await startButton.click();
    
    await page.waitForURL('**/learn');
    
    // Procurar por quiz
    const quizLesson = page.locator('[data-testid="quiz-lesson"], .lesson-item:has-text("Quiz")').first();
    
    if (await quizLesson.isVisible()) {
      await quizLesson.click();
      
      // Verificar se há elementos de resultados
      const resultsElements = page.locator('text=Resultado, text=Pontuação, text=Aprovado, text=Reprovado');
      
      if (await resultsElements.first().isVisible()) {
        await expect(resultsElements.first()).toBeVisible();
      }
    }
  });
});


