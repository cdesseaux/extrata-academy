# Correções de Autenticação - Erros 401

## Problemas Identificados e Corrigidos

### 1. **Variável KEYCLOAK_URL faltando no .env**
- **Problema**: O backend não conseguia validar tokens do Keycloak porque `KEYCLOAK_URL` não estava definida
- **Solução**: Adicionada `KEYCLOAK_URL=https://keycloak-hlg.extrata.com.br` no `.env`

### 2. **Validação de Audience muito restritiva**
- **Problema**: O Keycloak pode emitir tokens com diferentes audiences (academy-frontend, academy-backend, account)
- **Solução**: Modificada a estratégia Keycloak para aceitar múltiplos audiences e ter fallback caso o token não tenha audience

### 3. **Prefixo /api não estava configurado**
- **Problema**: URLs do frontend não incluíam `/api`
- **Solução**:
  - Adicionado `app.setGlobalPrefix('api')` no backend
  - Atualizado `API_BASE_URL` no frontend para incluir `/api`

### 4. **CORS não incluía domínios externos**
- **Problema**: CORS só permitia localhost
- **Solução**: Adicionado regex para permitir `*.extrata.com.br`

## Arquivos Modificados

### Backend
1. **`backend/src/main.ts`**
   - Adicionado prefixo global `/api`
   - Melhorado configuração CORS
   - Adicionado log de inicialização

2. **`backend/src/auth/strategies/keycloak.strategy.ts`**
   - Aceita múltiplos audiences: `academy-backend`, `academy-frontend`, `account`
   - Fallback para ignorar validação de audience se necessário
   - Melhorado logs de debug

3. **`backend/src/app.controller.ts`**
   - Adicionado endpoint `/api/health` para healthcheck

4. **`.env`**
   - Adicionada variável `KEYCLOAK_URL=https://keycloak-hlg.extrata.com.br`

### Frontend
1. **`frontend/src/lib/api.ts`**
   - Atualizado `API_BASE_URL` para incluir `/api`

## Como Testar

### 1. Reinicie o backend
```bash
cd backend
npm run start:dev
```

### 2. Verifique se está funcionando
```bash
curl http://localhost:4000/api/health
```

Deve retornar:
```json
{
  "status": "ok",
  "timestamp": "...",
  "uptime": 123.456,
  "environment": "development",
  "keycloak": {
    "url": "https://keycloak-hlg.extrata.com.br",
    "realm": "extrata",
    "clientId": "academy-backend"
  }
}
```

### 3. Teste com um token do Keycloak

#### 3.1. Obtenha um token do frontend
- Faça login no frontend
- Abra o DevTools (F12) > Console
- Execute: `localStorage.getItem('keycloak-token')`
- Copie o token

#### 3.2. Teste o token
```bash
# Debug do token (sem validação)
curl -H "Authorization: Bearer SEU_TOKEN_AQUI" http://localhost:4000/api/auth/debug

# Teste de validação completa
curl -H "Authorization: Bearer SEU_TOKEN_AQUI" http://localhost:4000/api/auth/test-token

# Verificar autenticação (deve retornar 200)
curl -H "Authorization: Bearer SEU_TOKEN_AQUI" http://localhost:4000/api/auth/verify

# Obter perfil
curl -H "Authorization: Bearer SEU_TOKEN_AQUI" http://localhost:4000/api/auth/profile
```

### 4. Teste endpoints protegidos

```bash
# Listar cursos (público)
curl http://localhost:4000/api/courses

# Minhas matrículas (protegido)
curl -H "Authorization: Bearer SEU_TOKEN_AQUI" http://localhost:4000/api/enrollments/my-enrollments

# Criar matrícula (protegido)
curl -X POST \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{"courseId":"ID_DO_CURSO"}' \
  http://localhost:4000/api/enrollments
```

## Endpoints de Debug

### `/api/auth/env-debug`
Mostra variáveis de ambiente (sem autenticação)

### `/api/auth/debug`
Decodifica token sem validar (sem autenticação)

### `/api/auth/test-token`
Testa validação completa do token (sem autenticação, mas precisa do header)

### `/api/auth/verify`
Verifica token com autenticação completa (requer autenticação)

## Logs do Backend

O backend agora mostra logs detalhados:
```
🔍 KeycloakStrategy.validate - Auth header: Presente
🔍 Token recebido, length: 1234
🔍 Token decodificado: true
🔍 Header kid: abc123
🔍 Obtendo chave pública para kid: abc123
🔍 Chave pública obtida: true
🔍 Verificando token com issuer: https://keycloak-hlg.extrata.com.br/realms/extrata
🔍 Verificando token com audience: academy-backend
Token Keycloak validado para usuário: username
```

## Checklist de Verificação

- [ ] Backend inicia sem erros
- [ ] `/api/health` retorna 200
- [ ] `/api/auth/env-debug` mostra KEYCLOAK_URL correto
- [ ] Token do Keycloak é decodificado corretamente
- [ ] Validação de token funciona (200 em `/api/auth/verify`)
- [ ] Endpoints protegidos retornam 200 com token
- [ ] Endpoints protegidos retornam 401 sem token
- [ ] Frontend consegue fazer requisições autenticadas

## Possíveis Problemas Restantes

### Token expirado
Se o token expirou, você verá:
```
❌ Erro na validação do token Keycloak: jwt expired
```
**Solução**: Faça logout e login novamente no frontend

### Keycloak não acessível
Se o Keycloak estiver indisponível:
```
❌ Erro na validação do token Keycloak: getaddrinfo ENOTFOUND keycloak-hlg.extrata.com.br
```
**Solução**: Verifique conectividade com `ping keycloak-hlg.extrata.com.br`

### Client ID incorreto
Se o client_id estiver errado:
```
❌ Erro na validação do token Keycloak: jwt audience invalid
```
**Solução**: Verificar configuração do Keycloak no realm `extrata`

## Próximos Passos

1. **Remover console.logs excessivos** após confirmar que tudo funciona
2. **Adicionar validação de DTOs** nos controllers
3. **Implementar rate limiting** para segurança
4. **Adicionar testes automatizados** de autenticação
5. **Configurar Swagger** para documentação da API
