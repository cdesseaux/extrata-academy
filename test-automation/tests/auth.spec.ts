import { test, expect } from '@playwright/test';

const TEST_CREDENTIALS = {
  username: '73023990182',
  password: 'Dessis12!'
};

test.describe('Autenticação', () => {
  test('deve fazer login com credenciais válidas', async ({ page }) => {
    await page.goto('/');
    
    // Aguardar o Keycloak carregar
    await page.waitForLoadState('networkidle');
    
    // Verificar se estamos na página de login do Keycloak
    await expect(page.locator('input[name="username"]')).toBeVisible();
    
    // Preencher credenciais
    await page.fill('input[name="username"]', TEST_CREDENTIALS.username);
    await page.fill('input[name="password"]', TEST_CREDENTIALS.password);
    
    // Clicar no botão de login
    await page.click('input[type="submit"]');
    
    // Aguardar redirecionamento para o dashboard
    await page.waitForURL('**/dashboard');
    
    // Verificar se o usuário está logado
    await expect(page.locator('text=Olá, Christophe')).toBeVisible();
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('deve exibir informações do usuário no dashboard', async ({ page }) => {
    // Fazer login primeiro
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[name="username"]', TEST_CREDENTIALS.username);
    await page.fill('input[name="password"]', TEST_CREDENTIALS.password);
    await page.click('input[type="submit"]');
    
    await page.waitForURL('**/dashboard');
    
    // Verificar informações do usuário
    await expect(page.locator('text=Christophe Desseaux')).toBeVisible();
    await expect(page.locator('text=christophe.desseaux@extrata.com.br')).toBeVisible();
    await expect(page.locator('text=730.239.901-82')).toBeVisible();
  });

  test('deve fazer logout corretamente', async ({ page }) => {
    // Fazer login primeiro
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[name="username"]', TEST_CREDENTIALS.username);
    await page.fill('input[name="password"]', TEST_CREDENTIALS.password);
    await page.click('input[type="submit"]');
    
    await page.waitForURL('**/dashboard');
    
    // Procurar botão de logout (pode estar em um menu dropdown)
    const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sair"), a:has-text("Logout")').first();
    
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await page.waitForURL('**/');
      await expect(page.locator('text=Login')).toBeVisible();
    }
  });
});


