#!/usr/bin/env node

/**
 * Script detalhado para diagnosticar problemas com Keycloak
 */

const https = require('https');
const http = require('http');

const KEYCLOAK_URL = 'https://keycloak-hlg.extrata.com.br';
const REALM = 'extrata';

console.log('🔍 Diagnóstico Detalhado do Keycloak\n');

function makeRequest(url, followRedirects = false) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const options = {
      method: 'GET',
      headers: {
        'User-Agent': 'Extrata-Academy-Diagnostic/1.0'
      }
    };

    const req = client.request(url, options, (res) => {
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

    req.end();
  });
}

async function diagnoseKeycloak() {
  try {
    console.log('1. 🔍 Testando conectividade básica...');
    const basicResponse = await makeRequest(KEYCLOAK_URL);
    console.log(`   Status: ${basicResponse.statusCode}`);
    console.log(`   Headers: ${JSON.stringify(basicResponse.headers, null, 2)}`);
    
    if (basicResponse.statusCode === 302) {
      console.log('   ✅ Redirecionamento detectado (normal)');
      const location = basicResponse.headers.location;
      if (location) {
        console.log(`   📍 Redirecionando para: ${location}`);
      }
    }

    console.log('\n2. 🔍 Testando diferentes endpoints do realm...');
    
    // Testar diferentes variações do endpoint
    const endpoints = [
      `/realms/${REALM}`,
      `/realms/${REALM}/`,
      `/auth/realms/${REALM}`,
      `/auth/realms/${REALM}/`
    ];

    for (const endpoint of endpoints) {
      try {
        const url = `${KEYCLOAK_URL}${endpoint}`;
        console.log(`   📡 Testando: ${url}`);
        const response = await makeRequest(url);
        console.log(`   Status: ${response.statusCode}`);
        
        if (response.statusCode === 200) {
          console.log('   ✅ Endpoint funcionando!');
          try {
            const data = JSON.parse(response.data);
            console.log(`   - Realm: ${data.realm}`);
            console.log(`   - Enabled: ${data.enabled}`);
            console.log(`   - Display Name: ${data.displayName || 'N/A'}`);
          } catch (e) {
            console.log('   - Dados recebidos (não é JSON)');
          }
        } else if (response.statusCode === 404) {
          console.log('   ❌ Endpoint não encontrado');
        } else {
          console.log(`   ⚠️  Status inesperado: ${response.statusCode}`);
        }
      } catch (error) {
        console.log(`   ❌ Erro: ${error.message}`);
      }
    }

    console.log('\n3. 🔍 Testando endpoints OpenID Connect...');
    
    const oidcEndpoints = [
      `/.well-known/openid_configuration`,
      `/realms/${REALM}/.well-known/openid_configuration`,
      `/auth/realms/${REALM}/.well-known/openid_configuration`,
      `/realms/${REALM}/protocol/openid-connect/.well-known/openid_configuration`,
      `/auth/realms/${REALM}/protocol/openid-connect/.well-known/openid_configuration`
    ];

    for (const endpoint of oidcEndpoints) {
      try {
        const url = `${KEYCLOAK_URL}${endpoint}`;
        console.log(`   📡 Testando: ${url}`);
        const response = await makeRequest(url);
        console.log(`   Status: ${response.statusCode}`);
        
        if (response.statusCode === 200) {
          console.log('   ✅ Endpoint OpenID Connect encontrado!');
          try {
            const data = JSON.parse(response.data);
            console.log(`   - Issuer: ${data.issuer}`);
            console.log(`   - Authorization Endpoint: ${data.authorization_endpoint}`);
            console.log(`   - Token Endpoint: ${data.token_endpoint}`);
          } catch (e) {
            console.log('   - Configuração recebida (não é JSON válido)');
          }
          break; // Se encontrou, não precisa testar os outros
        } else if (response.statusCode === 404) {
          console.log('   ❌ Endpoint não encontrado');
        } else {
          console.log(`   ⚠️  Status: ${response.statusCode}`);
        }
      } catch (error) {
        console.log(`   ❌ Erro: ${error.message}`);
      }
    }

    console.log('\n4. 🔍 Testando endpoints de administração...');
    
    const adminEndpoints = [
      `/admin`,
      `/auth/admin`,
      `/admin/realms/${REALM}`,
      `/auth/admin/realms/${REALM}`
    ];

    for (const endpoint of adminEndpoints) {
      try {
        const url = `${KEYCLOAK_URL}${endpoint}`;
        console.log(`   📡 Testando: ${url}`);
        const response = await makeRequest(url);
        console.log(`   Status: ${response.statusCode}`);
        
        if (response.statusCode === 200 || response.statusCode === 302) {
          console.log('   ✅ Endpoint de admin acessível');
          break;
        } else if (response.statusCode === 404) {
          console.log('   ❌ Endpoint não encontrado');
        } else {
          console.log(`   ⚠️  Status: ${response.statusCode}`);
        }
      } catch (error) {
        console.log(`   ❌ Erro: ${error.message}`);
      }
    }

    console.log('\n📋 Resumo do Diagnóstico:');
    console.log('- Se o realm foi encontrado mas OpenID Connect retorna 404,');
    console.log('  pode ser que o Keycloak esteja configurado de forma diferente.');
    console.log('- Verifique se o realm está habilitado no Keycloak Admin.');
    console.log('- Verifique se o OpenID Connect está habilitado no realm.');

  } catch (error) {
    console.error('❌ Erro no diagnóstico:', error.message);
  }
}

diagnoseKeycloak();

