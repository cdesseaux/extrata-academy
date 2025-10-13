#!/usr/bin/env node

/**
 * Script para testar endpoints manuais do Keycloak
 */

const https = require('https');
const http = require('http');

const KEYCLOAK_URL = 'https://keycloak-hlg.extrata.com.br';
const REALM = 'extrata';

console.log('🔍 Testando Endpoints Manuais do Keycloak\n');

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
          data: data,
          url: url
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

async function testManualEndpoints() {
  try {
    console.log('🧪 Testando endpoints manuais do OpenID Connect...\n');

    const endpoints = [
      {
        name: 'Authorization Endpoint',
        url: `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/auth`
      },
      {
        name: 'Token Endpoint',
        url: `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`
      },
      {
        name: 'UserInfo Endpoint',
        url: `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/userinfo`
      },
      {
        name: 'JWKS Endpoint',
        url: `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/certs`
      },
      {
        name: 'Logout Endpoint',
        url: `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/logout`
      }
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`📡 Testando: ${endpoint.name}`);
        console.log(`   URL: ${endpoint.url}`);
        
        const response = await makeRequest(endpoint.url);
        console.log(`   Status: ${response.statusCode}`);
        
        if (response.statusCode === 200) {
          console.log('   ✅ Endpoint funcionando!');
          
          if (endpoint.name === 'JWKS Endpoint') {
            try {
              const data = JSON.parse(response.data);
              console.log(`   - Keys disponíveis: ${data.keys ? data.keys.length : 0}`);
            } catch (e) {
              console.log('   - Dados recebidos (não é JSON válido)');
            }
          }
        } else if (response.statusCode === 404) {
          console.log('   ❌ Endpoint não encontrado');
        } else if (response.statusCode === 405) {
          console.log('   ⚠️  Método não permitido (normal para alguns endpoints)');
        } else {
          console.log(`   ⚠️  Status: ${response.statusCode}`);
        }
        
        console.log('');
        
      } catch (error) {
        console.log(`   ❌ Erro: ${error.message}\n`);
      }
    }

    console.log('📋 Resumo:');
    console.log('- Se os endpoints manuais funcionarem, podemos usar configuração manual');
    console.log('- Se não funcionarem, o OpenID Connect não está habilitado no realm');
    console.log('- Neste caso, será necessário habilitar no Keycloak Admin ou usar SAML');

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testManualEndpoints();


