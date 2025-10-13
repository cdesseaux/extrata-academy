#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando Testes Automatizados - Extrata Academy');
console.log('=' .repeat(60));

// Configurações
const TEST_CONFIG = {
  username: '73023990182',
  password: 'Dessis12!',
  baseUrl: 'http://localhost:3000',
  backendUrl: 'http://localhost:4000'
};

// Função para executar comando e capturar output
function runCommand(command, description) {
  console.log(`\n📋 ${description}`);
  console.log(`💻 Executando: ${command}`);
  
  try {
    const output = execSync(command, { 
      encoding: 'utf8', 
      stdio: 'pipe',
      cwd: __dirname 
    });
    console.log('✅ Sucesso');
    return { success: true, output };
  } catch (error) {
    console.log('❌ Erro:', error.message);
    return { success: false, error: error.message };
  }
}

// Função para verificar se os serviços estão rodando
async function checkServices() {
  console.log('\n🔍 Verificando Serviços...');
  
  const services = [
    { name: 'Frontend', url: 'http://localhost:3000' },
    { name: 'Backend', url: 'http://localhost:4000/api' }
  ];
  
  for (const service of services) {
    try {
      const response = await fetch(service.url);
      console.log(`✅ ${service.name}: ${response.status}`);
    } catch (error) {
      console.log(`❌ ${service.name}: Não disponível`);
      return false;
    }
  }
  
  return true;
}

// Função principal
async function main() {
  const startTime = new Date();
  
  // 1. Verificar dependências
  console.log('\n📦 Verificando Dependências...');
  if (!fs.existsSync('node_modules')) {
    console.log('📥 Instalando dependências...');
    runCommand('npm install', 'Instalando Playwright e dependências');
  }
  
  // 2. Instalar browsers do Playwright
  console.log('\n🌐 Instalando Browsers...');
  runCommand('npx playwright install', 'Instalando browsers do Playwright');
  
  // 3. Verificar serviços
  const servicesRunning = await checkServices();
  if (!servicesRunning) {
    console.log('\n⚠️  Aviso: Alguns serviços podem não estar rodando');
    console.log('   Certifique-se de que o frontend e backend estão ativos');
  }
  
  // 4. Executar testes
  console.log('\n🧪 Executando Testes...');
  
  const testSuites = [
    { name: 'Autenticação', file: 'auth.spec.ts' },
    { name: 'Cursos', file: 'courses.spec.ts' },
    { name: 'Quizzes', file: 'quizzes.spec.ts' },
    { name: 'Gamificação', file: 'gamification.spec.ts' },
    { name: 'PWA', file: 'pwa.spec.ts' },
    { name: 'Modo Escuro', file: 'theme.spec.ts' },
    { name: 'Fluxo Completo', file: 'complete-flow.spec.ts' }
  ];
  
  const results = [];
  
  for (const suite of testSuites) {
    console.log(`\n🎯 Executando: ${suite.name}`);
    const result = runCommand(
      `npx playwright test tests/${suite.file} --reporter=line`,
      `Teste: ${suite.name}`
    );
    
    results.push({
      suite: suite.name,
      success: result.success,
      error: result.error
    });
  }
  
  // 5. Gerar relatório
  console.log('\n📊 Relatório Final:');
  console.log('=' .repeat(60));
  
  const endTime = new Date();
  const duration = (endTime - startTime) / 1000;
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const total = results.length;
  
  console.log(`⏱️  Duração: ${duration.toFixed(2)}s`);
  console.log(`✅ Passou: ${passed}/${total}`);
  console.log(`❌ Falhou: ${failed}/${total}`);
  console.log(`📈 Taxa de Sucesso: ${((passed/total)*100).toFixed(1)}%`);
  
  console.log('\n📋 Detalhes:');
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`   ${status} ${result.suite}`);
    if (!result.success && result.error) {
      console.log(`      Erro: ${result.error}`);
    }
  });
  
  // 6. Salvar relatório
  const report = {
    timestamp: startTime.toISOString(),
    duration: duration,
    summary: {
      total,
      passed,
      failed,
      successRate: (passed/total)*100
    },
    results,
    config: TEST_CONFIG
  };
  
  fs.writeFileSync('test-report.json', JSON.stringify(report, null, 2));
  console.log('\n💾 Relatório salvo em: test-report.json');
  
  // 7. Abrir relatório HTML se disponível
  if (fs.existsSync('playwright-report/index.html')) {
    console.log('\n🌐 Abrindo relatório HTML...');
    runCommand('npx playwright show-report', 'Abrindo relatório HTML');
  }
  
  console.log('\n🎉 Testes Concluídos!');
  
  // Exit code baseado no resultado
  process.exit(failed > 0 ? 1 : 0);
}

// Executar se for chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main, runCommand, checkServices };


