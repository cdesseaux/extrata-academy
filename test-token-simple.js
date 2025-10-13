// Script simples para testar token real do Keycloak
const https = require('https');
const http = require('http');

function makeRequest(url, headers) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.request(url, { method: 'GET', headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.end();
  });
}

async function testToken(token) {
  if (!token || token === 'test-token') {
    console.log('❌ Token não fornecido!');
    console.log('Para obter o token:');
    console.log('1. Abra o navegador e vá para http://localhost:3000');
    console.log('2. Faça login no Keycloak');
    console.log('3. Abra o Console (F12)');
    console.log('4. Digite: localStorage.getItem("keycloak-token")');
    console.log('5. Copie o token e execute: node test-token-simple.js "SEU_TOKEN_AQUI"');
    return;
  }

  console.log('🧪 Testando token do Keycloak...');
  console.log('Token length:', token.length);
  console.log('Token preview:', token.substring(0, 50) + '...');
  
  try {
    const response = await makeRequest('http://localhost:4000/auth/test-token', {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    
    console.log('\n📊 Resultado:');
    console.log('Status:', response.statusCode);
    
    if (response.statusCode === 200) {
      const result = JSON.parse(response.body);
      
      console.log('\n🔍 Análise:');
      console.log('Token Length:', result.tokenLength);
      console.log('Token Preview:', result.tokenPreview);
      
      if (result.decoded) {
        console.log('\n📋 Header:');
        console.log(JSON.stringify(result.decoded.header, null, 2));
        
        console.log('\n📋 Payload:');
        console.log(JSON.stringify(result.decoded.payload, null, 2));
        
        if (result.validation) {
          console.log('\n✅ Validação:');
          console.log('Issuer Match:', result.validation.issuerMatch ? '✅ SIM' : '❌ NÃO');
          console.log('Expected Issuer:', result.validation.expectedIssuer);
          console.log('Actual Issuer:', result.validation.actualIssuer);
          console.log('Audience Match:', result.validation.audienceMatch ? '✅ SIM' : '❌ NÃO');
          console.log('Expected Audience:', result.validation.expectedAudience);
          console.log('Actual Audience:', result.validation.actualAudience);
          console.log('Is Expired:', result.validation.isExpired ? '❌ SIM' : '✅ NÃO');
          
          console.log('\n🔍 Diagnóstico:');
          if (!result.validation.issuerMatch) {
            console.log('❌ PROBLEMA: Issuer não confere!');
            console.log('   Esperado:', result.validation.expectedIssuer);
            console.log('   Recebido:', result.validation.actualIssuer);
          }
          if (!result.validation.audienceMatch) {
            console.log('❌ PROBLEMA: Audience não confere!');
            console.log('   Esperado:', result.validation.expectedAudience);
            console.log('   Recebido:', result.validation.actualAudience);
          }
          if (result.validation.isExpired) {
            console.log('❌ PROBLEMA: Token expirado!');
          }
        }
      }
    } else {
      console.log('Erro:', response.body);
    }
  } catch (error) {
    console.error('Erro:', error.message);
  }
}

const token = process.argv[2];
testToken(token).catch(console.error);







