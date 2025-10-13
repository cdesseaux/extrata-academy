# Configuração para Produção - Extrata Academy

## ✅ **Implementações Realizadas**

### 1. **Autenticação Keycloak Production Ready**
- ✅ Validação real de tokens JWT do Keycloak
- ✅ Verificação de assinatura com chaves públicas (JWKS)
- ✅ Sincronização automática de usuários
- ✅ Fallback para desenvolvimento (usuário mock)
- ✅ Tratamento robusto de erros

### 2. **Configurações de Ambiente**
- ✅ Variáveis de ambiente configuradas
- ✅ URLs do Keycloak externo
- ✅ Modo desenvolvimento vs produção
- ✅ Logs condicionais

### 3. **Segurança**
- ✅ Validação de issuer e audience
- ✅ Verificação de expiração de tokens
- ✅ Renovação automática de tokens
- ✅ Tratamento de erros de autenticação

## 🔧 **Configuração para Produção**

### **Variáveis de Ambiente (.env)**

```bash
# Modo de produção
NODE_ENV=production

# Keycloak (URLs reais)
KEYCLOAK_URL=https://keycloak-hlg.extrata.com.br
KEYCLOAK_REALM=extrata
KEYCLOAK_CLIENT_ID=academy-backend
KEYCLOAK_CLIENT_SECRET=seu-client-secret-real

# Frontend
NEXT_PUBLIC_KEYCLOAK_URL=https://keycloak-hlg.extrata.com.br
NEXT_PUBLIC_KEYCLOAK_REALM=extrata
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=academy-frontend

# Banco de dados (produção)
DB_SYNC=false
DB_LOGGING=false

# JWT (chave secreta forte)
JWT_SECRET=sua-chave-super-secreta-para-producao
```

### **Configuração do Keycloak**

1. **Cliente Backend** (`academy-backend`):
   - Access Type: `confidential`
   - Service Accounts: `enabled`
   - Valid Redirect URIs: `http://localhost:4000/*`
   - Web Origins: `http://localhost:4000`

2. **Cliente Frontend** (`academy-frontend`):
   - Access Type: `public`
   - Valid Redirect URIs: `http://localhost:3000/*`
   - Web Origins: `http://localhost:3000`

## 🚀 **Como Funciona Agora**

### **Fluxo de Autenticação**

1. **Frontend**:
   - Inicializa Keycloak com `check-sso`
   - Se não autenticado, redireciona para login
   - Armazena token e configura API client
   - Renovação automática de tokens

2. **Backend**:
   - Recebe token no header `Authorization: Bearer <token>`
   - Valida token com chaves públicas do Keycloak
   - Verifica issuer, audience e expiração
   - Cria/atualiza usuário no banco local
   - Retorna dados do usuário autenticado

### **Modos de Operação**

- **Desenvolvimento** (`NODE_ENV=development`):
  - Logs detalhados
  - Usa Keycloak real (sem fallback para mock)
  - Sincronização automática do banco (`DB_SYNC=true`)

- **Produção** (`NODE_ENV=production`):
  - Logs detalhados (para debug)
  - Usa Keycloak real
  - Banco não sincroniza automaticamente (`DB_SYNC=false`)

## 🧪 **Testando**

### **1. Teste com Keycloak Real**
```bash
# 1. Configure NODE_ENV=production
# 2. Reinicie o backend
# 3. Acesse http://localhost:3000
# 4. Deve redirecionar para Keycloak
# 5. Faça login com usuário real
# 6. Deve voltar autenticado
```

### **2. Teste de Matrícula**
```bash
# 1. Acesse um curso
# 2. Clique em "Matricular-se"
# 3. Deve criar matrícula no banco
# 4. Verifique no dashboard
```

## 🔍 **Monitoramento**

### **Logs Importantes**
- `Token Keycloak validado para usuário: <username>`
- `Criando novo usuário do Keycloak: <username>`
- `Atualizando usuário existente: <username>`

### **Erros Comuns**
- `Token inválido ou expirado`: Token expirou ou é inválido
- `Token não fornecido`: Header Authorization ausente
- `Invalid token issuer`: Token não é do Keycloak correto

## 📋 **Checklist de Produção**

- [ ] Configurar `NODE_ENV=production`
- [ ] Definir `JWT_SECRET` forte
- [ ] Configurar `DB_SYNC=false`
- [ ] Configurar `DB_LOGGING=false`
- [ ] Verificar URLs do Keycloak
- [ ] Testar login com usuários reais
- [ ] Testar renovação de tokens
- [ ] Verificar logs de erro
- [ ] Testar matrículas
- [ ] Configurar monitoramento

## 🎯 **Próximos Passos**

1. **RBAC**: Implementar controle de acesso baseado em roles
2. **Auditoria**: Log de ações dos usuários
3. **Rate Limiting**: Limitar requisições por usuário
4. **Cache**: Cache de tokens e dados de usuário
5. **Health Checks**: Endpoints de saúde da aplicação
