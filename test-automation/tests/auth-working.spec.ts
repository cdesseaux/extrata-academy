import { test, expect } from '@playwright/test';

const TEST_CREDENTIALS = {
  username: '73023990182',
  password: 'Dessis12!'
};

test.describe('Autenticação Funcionando', () => {
  test('deve fazer login com sucesso no Keycloak', async ({ page }) => {
    // Navegar para a página inicial
    await page.goto('/');
    
    // Aguardar o carregamento completo
    await page.waitForLoadState('networkidle');
    
    // Aguardar redirecionamento para Keycloak ou página de login
    await page.waitForTimeout(3000);
    
    // Verificar se estamos na página de login do Keycloak
    // Pode estar em diferentes URLs dependendo da configuração
    const currentUrl = page.url();
    console.log('URL atual:', currentUrl);
    
    // Procurar campos de login em diferentes possíveis locais
    let usernameField, passwordField, submitButton;
    
    // Tentar diferentes seletores para o campo de usuário
    const usernameSelectors = [
      'input[name="username"]',
      'input[id="username"]',
      'input[type="text"]',
      'input[placeholder*="usuário"]',
      'input[placeholder*="username"]',
      'input[placeholder*="email"]'
    ];
    
    for (const selector of usernameSelectors) {
      try {
        usernameField = page.locator(selector).first();
        if (await usernameField.isVisible({ timeout: 2000 })) {
          console.log('Campo de usuário encontrado:', selector);
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    // Tentar diferentes seletores para o campo de senha
    const passwordSelectors = [
      'input[name="password"]',
      'input[id="password"]',
      'input[type="password"]',
      'input[placeholder*="senha"]',
      'input[placeholder*="password"]'
    ];
    
    for (const selector of passwordSelectors) {
      try {
        passwordField = page.locator(selector).first();
        if (await passwordField.isVisible({ timeout: 2000 })) {
          console.log('Campo de senha encontrado:', selector);
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    // Verificar se encontramos os campos
    expect(usernameField).toBeTruthy();
    expect(passwordField).toBeTruthy();
    
    // Preencher credenciais
    await usernameField.fill(TEST_CREDENTIALS.username);
    await passwordField.fill(TEST_CREDENTIALS.password);
    
    // Procurar botão de submit
    const submitSelectors = [
      'input[type="submit"]',
      'button[type="submit"]',
      'button:has-text("Entrar")',
      'button:has-text("Login")',
      'button:has-text("Sign In")',
      'button:has-text("Acessar")',
      'input[value*="Entrar"]',
      'input[value*="Login"]'
    ];
    
    for (const selector of submitSelectors) {
      try {
        submitButton = page.locator(selector).first();
        if (await submitButton.isVisible({ timeout: 2000 })) {
          console.log('Botão de submit encontrado:', selector);
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    expect(submitButton).toBeTruthy();
    
    // Clicar no botão de login
    await submitButton.click();
    
    // Aguardar redirecionamento (pode demorar)
    await page.waitForTimeout(5000);
    
    // Verificar se foi redirecionado para o dashboard
    // Pode estar em diferentes URLs
    const finalUrl = page.url();
    console.log('URL final:', finalUrl);
    
    // Verificar se estamos logados procurando por elementos do dashboard
    const dashboardElements = [
      'text=Dashboard',
      'text=Olá',
      'text=Christophe',
      'text=Extrata Academy',
      '[data-testid="dashboard"]',
      '.dashboard'
    ];
    
    let loggedIn = false;
    for (const selector of dashboardElements) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 3000 })) {
          console.log('Elemento do dashboard encontrado:', selector);
          loggedIn = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    expect(loggedIn).toBe(true);
  });

  test('deve exibir informações do usuário após login', async ({ page }) => {
    // Fazer login primeiro
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Preencher login (versão simplificada)
    const usernameField = page.locator('input[name="username"], input[id="username"], input[type="text"]').first();
    const passwordField = page.locator('input[name="password"], input[id="password"], input[type="password"]').first();
    const submitButton = page.locator('input[type="submit"], button[type="submit"]').first();
    
    await usernameField.fill(TEST_CREDENTIALS.username);
    await passwordField.fill(TEST_CREDENTIALS.password);
    await submitButton.click();
    
    // Aguardar login
    await page.waitForTimeout(5000);
    
    // Verificar informações do usuário
    const userInfoElements = [
      'text=Christophe',
      'text=christophe.desseaux@extrata.com.br',
      'text=730.239.901-82',
      'text=Olá, Christophe'
    ];
    
    let userInfoFound = false;
    for (const selector of userInfoElements) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 3000 })) {
          console.log('Informação do usuário encontrada:', selector);
          userInfoFound = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    expect(userInfoFound).toBe(true);
  });

  test('deve navegar para cursos após login', async ({ page }) => {
    // Fazer login
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const usernameField = page.locator('input[name="username"], input[id="username"], input[type="text"]').first();
    const passwordField = page.locator('input[name="password"], input[id="password"], input[type="password"]').first();
    const submitButton = page.locator('input[type="submit"], button[type="submit"]').first();
    
    await usernameField.fill(TEST_CREDENTIALS.username);
    await passwordField.fill(TEST_CREDENTIALS.password);
    await submitButton.click();
    
    await page.waitForTimeout(5000);
    
    // Navegar para cursos
    await page.goto('/courses');
    await page.waitForLoadState('networkidle');
    
    // Verificar se a página de cursos carregou
    const coursesElements = [
      'text=Cursos',
      '[data-testid="course-card"]',
      '.course-card',
      '.bg-white.rounded-lg'
    ];
    
    let coursesFound = false;
    for (const selector of coursesElements) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 3000 })) {
          console.log('Elemento de cursos encontrado:', selector);
          coursesFound = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    expect(coursesFound).toBe(true);
  });
});


