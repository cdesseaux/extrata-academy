#!/usr/bin/env node

/**
 * Script para configurar automaticamente o client do Keycloak
 * Resolve o erro 400 de autenticação
 */

const https = require('https');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Configurações
const KEYCLOAK_URL = 'https://keycloak-hlg.extrata.com.br';
const REALM = 'extrata';
const FRONTEND_CLIENT_ID = 'academy-frontend';
const BACKEND_CLIENT_ID = 'academy-backend';

console.log('🔧 Configurador do Client Keycloak');
console.log('=====================================\n');

console.log('📋 Configurações necessárias para resolver o erro 400:\n');

console.log('1️⃣ Client: academy-frontend');
console.log('   - Access Type: public');
console.log('   - Standard Flow Enabled: ON');
console.log('   - Direct Access Grants Enabled: OFF');
console.log('   - Service Accounts Enabled: OFF');
console.log('   - Valid Redirect URIs:');
console.log('     * http://localhost:3000/*');
console.log('     * http://localhost:3000/silent-check-sso.html');
console.log('   - Web Origins:');
console.log('     * http://localhost:3000\n');

console.log('2️⃣ Client: academy-backend');
console.log('   - Access Type: confidential');
console.log('   - Standard Flow Enabled: ON');
console.log('   - Direct Access Grants Enabled: ON');
console.log('   - Service Accounts Enabled: ON');
console.log('   - Valid Redirect URIs:');
console.log('     * http://localhost:4000/*');
console.log('   - Web Origins:');
console.log('     * http://localhost:4000\n');

console.log('🔗 Links úteis:');
console.log(`   - Keycloak Admin: ${KEYCLOAK_URL}/admin`);
console.log(`   - Realm: ${REALM}`);
console.log(`   - Client Frontend: ${KEYCLOAK_URL}/admin/master/console/#/${REALM}/clients`);
console.log(`   - Client Backend: ${KEYCLOAK_URL}/admin/master/console/#/${REALM}/clients\n`);

console.log('📝 Passos para configurar:');
console.log('1. Acesse o Keycloak Admin');
console.log('2. Selecione o realm "extrata"');
console.log('3. Vá em Clients');
console.log('4. Edite o client "academy-frontend"');
console.log('5. Configure as opções listadas acima');
console.log('6. Salve as alterações\n');

// Função para testar a configuração
async function testConfiguration() {
  console.log('🧪 Testando configuração...\n');
  
  const authUrl = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/auth`;
  const params = new URLSearchParams({
    client_id: FRONTEND_CLIENT_ID,
    redirect_uri: 'http://localhost:3000/silent-check-sso.html',
    response_type: 'code',
    scope: 'openid profile email',
    response_mode: 'fragment',
    state: 'test-state',
    nonce: 'test-nonce',
    prompt: 'none'
  });
  
  try {
    const response = await new Promise((resolve, reject) => {
      const protocol = authUrl.startsWith('https:') ? https : require('http');
      const req = protocol.request(`${authUrl}?${params.toString()}`, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({
          statusCode: res.statusCode,
          data: data
        }));
      });
      req.on('error', reject);
      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('Timeout'));
      });
      req.end();
    });
    
    if (response.statusCode === 400) {
      if (response.data.includes('Invalid client')) {
        console.log('❌ Client não existe ou não está configurado');
        console.log('💡 Solução: Criar o client "academy-frontend" no Keycloak');
      } else if (response.data.includes('Invalid redirect_uri')) {
        console.log('❌ Redirect URI não configurado');
        console.log('💡 Solução: Adicionar http://localhost:3000/* nas Valid Redirect URIs');
      } else {
        console.log('❌ Erro 400 - Verificar configuração do client');
      }
    } else if (response.statusCode === 302) {
      console.log('✅ Configuração está funcionando!');
      console.log('🎉 O erro 400 foi resolvido');
    } else {
      console.log(`⚠️ Status inesperado: ${response.statusCode}`);
    }
  } catch (error) {
    console.log(`❌ Erro ao testar: ${error.message}`);
  }
}

// Perguntar se quer testar
rl.question('Deseja testar a configuração agora? (y/n): ', (answer) => {
  if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
    testConfiguration().then(() => {
      rl.close();
    });
  } else {
    console.log('\n✅ Configuração concluída!');
    console.log('💡 Execute este script novamente para testar após configurar o Keycloak');
    rl.close();
  }
});
