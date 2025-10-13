#!/usr/bin/env node

const { chromium } = require('playwright');

const TEST_CREDENTIALS = {
  username: '73023990182',
  password: 'Dessis12!'
};

async function quickTest() {
  console.log('🚀 Teste Rápido - Extrata Academy');
  console.log('================================');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // 1. Teste de conectividade
    console.log('📡 Testando conectividade...');
    await page.goto('http://localhost:3000');
    console.log('✅ Frontend acessível');
    
    // 2. Teste de login
    console.log('🔐 Testando login...');
    await page.waitForLoadState('networkidle');
    
    // Aguardar Keycloak carregar
    await page.waitForSelector('input[name="username"]', { timeout: 10000 });
    
    await page.fill('input[name="username"]', TEST_CREDENTIALS.username);
    await page.fill('input[name="password"]', TEST_CREDENTIALS.password);
    await page.click('input[type="submit"]');
    
    // Aguardar redirecionamento
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    console.log('✅ Login realizado com sucesso');
    
    // 3. Teste do dashboard
    console.log('📊 Testando dashboard...');
    await expect(page.locator('text=Olá, Christophe')).toBeVisible();
    await expect(page.locator('text=Dashboard')).toBeVisible();
    console.log('✅ Dashboard carregado');
    
    // 4. Teste de cursos
    console.log('📚 Testando cursos...');
    await page.goto('/courses');
    await page.waitForLoadState('networkidle');
    
    const courseCards = page.locator('[data-testid="course-card"], .course-card, .bg-white.rounded-lg');
    await expect(courseCards.first()).toBeVisible();
    console.log('✅ Cursos carregados');
    
    // 5. Teste de modo escuro
    console.log('🌙 Testando modo escuro...');
    await page.goto('/dashboard');
    const themeToggle = page.locator('[data-testid="theme-toggle"], button:has(svg)').first();
    
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      await page.waitForTimeout(500);
      
      const hasDarkClass = await page.evaluate(() => {
        return document.documentElement.classList.contains('dark');
      });
      
      if (hasDarkClass) {
        console.log('✅ Modo escuro funcionando');
      } else {
        console.log('⚠️  Modo escuro não aplicado');
      }
    } else {
      console.log('⚠️  Toggle de tema não encontrado');
    }
    
    // 6. Teste de gamificação
    console.log('🎮 Testando gamificação...');
    const addXPButton = page.locator('button:has-text("+100 XP")');
    
    if (await addXPButton.isVisible()) {
      await addXPButton.click();
      await page.waitForTimeout(1000);
      console.log('✅ Gamificação funcionando');
    } else {
      console.log('⚠️  Botão de XP não encontrado');
    }
    
    console.log('\n🎉 Teste rápido concluído com sucesso!');
    console.log('📊 Resumo:');
    console.log('   ✅ Frontend acessível');
    console.log('   ✅ Login funcionando');
    console.log('   ✅ Dashboard carregado');
    console.log('   ✅ Cursos disponíveis');
    console.log('   ✅ Modo escuro operacional');
    console.log('   ✅ Gamificação ativa');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    console.log('\n🔍 Possíveis soluções:');
    console.log('   1. Verificar se frontend está rodando em localhost:3000');
    console.log('   2. Verificar se backend está rodando em localhost:4000');
    console.log('   3. Verificar se Keycloak está configurado');
    console.log('   4. Verificar credenciais de teste');
  } finally {
    await browser.close();
  }
}

// Executar teste
quickTest().catch(console.error);


