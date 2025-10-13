#!/usr/bin/env node

/**
 * Script para testar conexão com Keycloak externo do Extrata
 * Execute: node scripts/test-keycloak-connection.js
 */

const https = require('https');
const http = require('http');

// Configurações do Keycloak
const KEYCLOAK_URL = process.env.KEYCLOAK_URL || 'https://keycloak-hlg.extrata.com.br';
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM || 'extrata';

console.log('🔍 Testando conexão com Keycloak externo...\n');

// Função para fazer requisição HTTP/HTTPS
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

async function testKeycloakConnection() {
  try {
    console.log(`📡 Testando: ${KEYCLOAK_URL}`);
    
    // Teste 1: Verificar se o servidor Keycloak está acessível
    console.log('1. Testando conectividade básica...');
    const basicResponse = await makeRequest(KEYCLOAK_URL);
    
    if (basicResponse.statusCode === 200) {
      console.log('✅ Keycloak está acessível');
    } else {
      console.log(`⚠️  Keycloak retornou status: ${basicResponse.statusCode}`);
    }

    // Teste 2: Verificar endpoint de realm
    console.log('\n2. Testando endpoint do realm...');
    const realmUrl = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}`;
    console.log(`📡 Testando: ${realmUrl}`);
    
    const realmResponse = await makeRequest(realmUrl);
    
    if (realmResponse.statusCode === 200) {
      console.log('✅ Realm encontrado');
      
      try {
        const realmData = JSON.parse(realmResponse.data);
        console.log(`   - Realm: ${realmData.realm}`);
        console.log(`   - Display Name: ${realmData.displayName || 'N/A'}`);
        console.log(`   - Enabled: ${realmData.enabled}`);
      } catch (e) {
        console.log('   - Dados do realm recebidos (não é JSON válido)');
      }
    } else {
      console.log(`❌ Realm não encontrado. Status: ${realmResponse.statusCode}`);
    }

    // Teste 3: Verificar endpoint de configuração OpenID Connect
    console.log('\n3. Testando configuração OpenID Connect...');
    const configUrl = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/.well-known/openid_configuration`;
    console.log(`📡 Testando: ${configUrl}`);
    
    const configResponse = await makeRequest(configUrl);
    
    if (configResponse.statusCode === 200) {
      console.log('✅ Configuração OpenID Connect encontrada');
      
      try {
        const configData = JSON.parse(configResponse.data);
        console.log(`   - Issuer: ${configData.issuer}`);
        console.log(`   - Authorization Endpoint: ${configData.authorization_endpoint}`);
        console.log(`   - Token Endpoint: ${configData.token_endpoint}`);
        console.log(`   - Userinfo Endpoint: ${configData.userinfo_endpoint}`);
      } catch (e) {
        console.log('   - Configuração recebida (não é JSON válido)');
      }
    } else {
      console.log(`❌ Configuração OpenID Connect não encontrada. Status: ${configResponse.statusCode}`);
    }

    console.log('\n🎉 Teste de conectividade concluído!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Configure o CLIENT_SECRET no arquivo .env');
    console.log('2. Crie os clients "academy-backend" e "academy-frontend" no Keycloak');
    console.log('3. Configure as URLs de redirecionamento');
    console.log('4. Teste a autenticação completa');

  } catch (error) {
    console.error('❌ Erro ao testar conexão:', error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.log('\n💡 Possíveis soluções:');
      console.log('- Verifique se a URL do Keycloak está correta');
      console.log('- Verifique sua conexão com a internet');
      console.log('- Verifique se o servidor Keycloak está online');
    } else if (error.message === 'Timeout') {
      console.log('\n💡 Possíveis soluções:');
      console.log('- O servidor pode estar lento ou indisponível');
      console.log('- Verifique sua conexão de rede');
    }
  }
}

// Executar teste
testKeycloakConnection();
