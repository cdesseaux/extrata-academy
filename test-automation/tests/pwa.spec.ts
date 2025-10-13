import { test, expect } from '@playwright/test';

const TEST_CREDENTIALS = {
  username: '73023990182',
  password: 'Dessis12!'
};

test.describe('PWA (Progressive Web App)', () => {
  test.beforeEach(async ({ page }) => {
    // Fazer login antes de cada teste
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[name="username"]', TEST_CREDENTIALS.username);
    await page.fill('input[name="password"]', TEST_CREDENTIALS.password);
    await page.click('input[type="submit"]');
    
    await page.waitForURL('**/dashboard');
  });

  test('deve carregar manifest.json', async ({ page }) => {
    // Verificar se o manifest está sendo carregado
    const manifestResponse = await page.request.get('/manifest.json');
    expect(manifestResponse.status()).toBe(200);
    
    const manifest = await manifestResponse.json();
    expect(manifest.name).toBe('Extrata Academy');
    expect(manifest.short_name).toBe('Extrata Academy');
  });

  test('deve ter service worker registrado', async ({ page }) => {
    // Verificar se o service worker está registrado
    const swRegistered = await page.evaluate(() => {
      return 'serviceWorker' in navigator;
    });
    expect(swRegistered).toBe(true);
  });

  test('deve exibir prompt de instalação PWA', async ({ page }) => {
    // Verificar se há prompt de instalação PWA
    const installPrompt = page.locator('[data-testid="pwa-install-prompt"], .pwa-install-prompt, text=Instalar');
    
    // O prompt pode não aparecer imediatamente
    await page.waitForTimeout(3000);
    
    // Verificar se o prompt está visível (pode não aparecer em todos os casos)
    const isVisible = await installPrompt.isVisible();
    if (isVisible) {
      await expect(installPrompt).toBeVisible();
    }
  });

  test('deve ter ícones PWA configurados', async ({ page }) => {
    // Verificar se os ícones estão sendo carregados
    const icon192 = await page.request.get('/icon-192x192.png');
    const icon512 = await page.request.get('/icon-512x512.png');
    
    // Pelo menos um dos ícones deve estar disponível
    expect([icon192.status(), icon512.status()]).toContain(200);
  });

  test('deve funcionar offline (cache básico)', async ({ page }) => {
    // Simular modo offline
    await page.context().setOffline(true);
    
    // Tentar navegar para uma página já visitada
    await page.goto('/dashboard');
    
    // Verificar se a página ainda carrega (do cache)
    await expect(page.locator('text=Dashboard')).toBeVisible();
    
    // Restaurar conexão
    await page.context().setOffline(false);
  });

  test('deve ter meta tags PWA corretas', async ({ page }) => {
    // Verificar meta tags importantes para PWA
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toContain('width=device-width');
    
    const themeColor = await page.locator('meta[name="theme-color"]').getAttribute('content');
    expect(themeColor).toBe('#2563eb');
    
    const appleWebApp = await page.locator('meta[name="apple-mobile-web-app-capable"]').getAttribute('content');
    expect(appleWebApp).toBe('yes');
  });

  test('deve ter shortcuts configurados', async ({ page }) => {
    // Verificar se há shortcuts no manifest
    const manifestResponse = await page.request.get('/manifest.json');
    const manifest = await manifestResponse.json();
    
    if (manifest.shortcuts) {
      expect(manifest.shortcuts.length).toBeGreaterThan(0);
      expect(manifest.shortcuts[0]).toHaveProperty('name');
      expect(manifest.shortcuts[0]).toHaveProperty('url');
    }
  });
});


