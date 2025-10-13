# Como Testar a Autenticação do Frontend

## 1. Abra o navegador e acesse o frontend
```
http://localhost:3000
```

## 2. Abra o DevTools (F12) e vá para a aba Console

## 3. Verifique se o token está salvo
```javascript
localStorage.getItem('keycloak-token')
```

Se retornar `null`, você precisa fazer login novamente.

## 4. Teste uma requisição manual
```javascript
const token = localStorage.getItem('keycloak-token');

fetch('http://localhost:4000/api/auth/verify', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => console.log('Resposta:', data))
.catch(err => console.error('Erro:', err));
```

## 5. Teste as minhas matrículas
```javascript
const token = localStorage.getItem('keycloak-token');

fetch('http://localhost:4000/api/enrollments/my-enrollments', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => console.log('Matrículas:', data))
.catch(err => console.error('Erro:', err));
```

## 6. Monitore os logs no console

### O que você deve ver (sucesso):
```
🔧 Enviando token para: /enrollments/my-enrollments
🔧 Token length: 1234
🔧 Token preview: eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI...
```

### O que indica problema:
```
❌ Nenhum token disponível para a requisição: /enrollments/my-enrollments
```

## 7. Verifique o Network no DevTools

1. Vá para a aba **Network**
2. Filtre por **Fetch/XHR**
3. Faça uma requisição (ex: vá para `/dashboard`)
4. Clique em uma requisição que falhou com 401
5. Veja os **Headers** → **Request Headers**
6. Confirme se há `Authorization: Bearer TOKEN`

## Se o token NÃO estiver sendo enviado:

### Solução 1: Limpe o localStorage e faça login novamente
```javascript
localStorage.clear();
window.location.reload();
```

### Solução 2: Force a configuração do token
```javascript
// Obtenha o token do Keycloak
const kc = window.keycloak; // ou window.keycloakAlternative
if (kc && kc.token) {
  localStorage.setItem('keycloak-token', kc.token);
  console.log('Token salvo:', kc.token.substring(0, 50) + '...');
  window.location.reload();
}
```

### Solução 3: Verifique se o apiClient está importado corretamente
Vá para a aba **Sources** no DevTools e procure por `api.ts`. Verifique se o método `getTokenFromStorage` existe.

## Diagnóstico Completo

Execute este script no console para um diagnóstico completo:

```javascript
console.log('=== DIAGNÓSTICO DE AUTENTICAÇÃO ===');
console.log('');

// 1. Verificar localStorage
console.log('1. Token no localStorage:');
const token = localStorage.getItem('keycloak-token');
console.log('  - Existe?', !!token);
console.log('  - Length:', token ? token.length : 0);
console.log('  - Preview:', token ? token.substring(0, 50) + '...' : 'N/A');
console.log('');

// 2. Verificar usuário salvo
console.log('2. Usuário no localStorage:');
const user = localStorage.getItem('keycloak-user');
console.log('  - Existe?', !!user);
console.log('  - Dados:', user ? JSON.parse(user) : 'N/A');
console.log('');

// 3. Verificar instâncias Keycloak
console.log('3. Instâncias Keycloak:');
console.log('  - window.keycloak?', !!window.keycloak);
console.log('  - window.keycloak.authenticated?', window.keycloak?.authenticated);
console.log('  - window.keycloak.token?', !!window.keycloak?.token);
console.log('');

// 4. Testar requisição
console.log('4. Testando requisição...');
if (token) {
  fetch('http://localhost:4000/api/auth/verify', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  .then(res => {
    console.log('  - Status:', res.status);
    return res.json();
  })
  .then(data => {
    console.log('  - Resposta:', data);
    console.log('');
    console.log('✅ AUTENTICAÇÃO OK!');
  })
  .catch(err => {
    console.error('  - Erro:', err);
    console.log('');
    console.log('❌ AUTENTICAÇÃO FALHOU!');
  });
} else {
  console.log('  - Não foi possível testar (sem token)');
  console.log('');
  console.log('❌ FAÇA LOGIN PRIMEIRO!');
}
```

## Próximos Passos

Se tudo estiver OK no diagnóstico mas ainda houver erros 401:
1. Verifique se o backend está rodando
2. Verifique se o token não expirou
3. Verifique se a URL da API está correta
4. Verifique os logs do backend para mais detalhes
