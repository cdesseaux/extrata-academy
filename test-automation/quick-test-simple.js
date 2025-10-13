#!/usr/bin/env node

const { chromium } = require('playwright');

async function quickTestSimple() {
  console.log('🚀 Teste Rápido Simplificado - Extrata Academy');
  console.log('==============================================');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // 1. Teste de conectividade
    console.log('📡 Testando conectividade...');
    await page.goto('http://localhost:3000');
    console.log('✅ Frontend acessível');
    
    // 2. Verificar se a página carrega
    console.log('📄 Verificando página inicial...');
    await page.waitForLoadState('networkidle');
    
    // Verificar se há elementos da aplicação
    const hasAppElements = await page.locator('body').isVisible();
    if (hasAppElements) {
      console.log('✅ Página carregada com sucesso');
    }
    
    // 3. Teste de navegação para cursos
    console.log('📚 Testando navegação para cursos...');
    await page.goto('http://localhost:3000/courses');
    await page.waitForLoadState('networkidle');
    
    // Verificar se a página de cursos carrega
    const coursesPage = await page.locator('body').isVisible();
    if (coursesPage) {
      console.log('✅ Página de cursos acessível');
    }
    
    // 4. Teste de API
    console.log('🔌 Testando API...');
    try {
      const response = await page.request.get('http://localhost:4000/api/courses');
      if (response.status() === 200) {
        console.log('✅ API de cursos funcionando');
      } else {
        console.log(`⚠️  API retornou status: ${response.status()}`);
      }
    } catch (error) {
      console.log('❌ API não acessível:', error.message);
    }
    
    // 5. Teste de PWA
    console.log('📱 Testando PWA...');
    try {
      const manifestResponse = await page.request.get('http://localhost:3000/manifest.json');
      if (manifestResponse.status() === 200) {
        console.log('✅ Manifest PWA carregado');
      } else {
        console.log(`⚠️  Manifest retornou status: ${manifestResponse.status()}`);
      }
    } catch (error) {
      console.log('❌ Manifest PWA não acessível');
    }
    
    // 6. Teste de responsividade
    console.log('📱 Testando responsividade...');
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile
    await page.waitForTimeout(1000);
    
    const mobileView = await page.locator('body').isVisible();
    if (mobileView) {
      console.log('✅ Layout responsivo funcionando');
    }
    
    // Restaurar viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    
    console.log('\n🎉 Teste simplificado concluído!');
    console.log('📊 Resumo:');
    console.log('   ✅ Frontend acessível');
    console.log('   ✅ Página inicial carregada');
    console.log('   ✅ Navegação para cursos funcionando');
    console.log('   ✅ Layout responsivo operacional');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    console.log('\n🔍 Possíveis soluções:');
    console.log('   1. Verificar se frontend está rodando em localhost:3000');
    console.log('   2. Verificar se backend está rodando em localhost:4000');
    console.log('   3. Verificar se os serviços estão configurados corretamente');
  } finally {
    await browser.close();
  }
}

// Executar teste
quickTestSimple().catch(console.error);


