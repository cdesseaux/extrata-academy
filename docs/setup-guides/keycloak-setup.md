# 🔐 Guia de Configuração - Keycloak Externo (Extrata)

## 📋 Pré-requisitos

- Acesso ao Keycloak do Extrata: `https://keycloak-hlg.extrata.com.br`
- Permissões de administrador no realm `extrata`
- Conhecimento básico de OAuth2/OpenID Connect

## 🚀 Passo 1: Configurar Variáveis de Ambiente

### 1.1 Atualizar arquivo `.env`

```bash
# Keycloak (External Extrata)
KEYCLOAK_URL=https://keycloak-hlg.extrata.com.br
KEYCLOAK_REALM=extrata
KEYCLOAK_CLIENT_ID=academy-backend
KEYCLOAK_CLIENT_SECRET=your-client-secret-here

# URLs
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_KEYCLOAK_URL=https://keycloak-hlg.extrata.com.br

# Frontend Public Vars
NEXT_PUBLIC_KEYCLOAK_REALM=extrata
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=academy-frontend
```

### 1.2 Testar Conectividade

```bash
# Testar se o Keycloak está acessível
node scripts/test-keycloak-connection.js
```

## 🔧 Passo 2: Configurar Clients no Keycloak

### 2.1 Acessar Keycloak Admin

1. Acesse: `https://keycloak-hlg.extrata.com.br/admin`
2. Faça login com suas credenciais de administrador
3. Selecione o realm `extrata`

### 2.2 Criar Client para Backend (academy-backend)

1. **Clients** → **Create**
2. **Client ID**: `academy-backend`
3. **Client Protocol**: `openid-connect`
4. **Root URL**: `http://localhost:4000`

#### Configurações do Client:

**Settings:**
- **Access Type**: `confidential`
- **Standard Flow Enabled**: `ON`
- **Direct Access Grants Enabled**: `ON`
- **Service Accounts Enabled**: `ON`
- **Authorization Enabled**: `OFF`

**Credentials:**
- Copie o **Secret** e cole no `.env` como `KEYCLOAK_CLIENT_SECRET`

### 2.3 Criar Client para Frontend (academy-frontend)

1. **Clients** → **Create**
2. **Client ID**: `academy-frontend`
3. **Client Protocol**: `openid-connect`
4. **Root URL**: `http://localhost:3000`

#### Configurações do Client:

**Settings:**
- **Access Type**: `public`
- **Standard Flow Enabled**: `ON`
- **Implicit Flow Enabled**: `OFF`
- **Direct Access Grants Enabled**: `OFF`
- **Service Accounts Enabled**: `OFF`

**Valid Redirect URIs:**
```
http://localhost:3000/*
http://localhost:3000/auth/callback
http://localhost:3000/auth/silent-callback
```

**Web Origins:**
```
http://localhost:3000
```

## 🧪 Passo 3: Testar Configuração

### 3.1 Iniciar Infraestrutura

```bash
# Iniciar apenas PostgreSQL e Redis
docker-compose up -d postgres redis

# Verificar se estão rodando
docker-compose ps
```

### 3.2 Testar Backend

```bash
cd backend
npm run start:dev
```

### 3.3 Testar Frontend

```bash
cd frontend
npm run dev
```

### 3.4 Verificar Endpoints

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:4000
- **Swagger**: http://localhost:4000/api/docs

## 🔍 Passo 4: Verificar Autenticação

### 4.1 Testar Login

1. Acesse http://localhost:3000
2. Clique em "Entrar"
3. Deve redirecionar para o Keycloak do Extrata
4. Faça login com suas credenciais
5. Deve retornar para a aplicação autenticado

### 4.2 Verificar Token

No browser (F12 → Console):
```javascript
// Verificar se o token está sendo armazenado
localStorage.getItem('access_token')
```

## 🐛 Troubleshooting

### Problema: "Client not found"

**Solução:**
- Verifique se o `KEYCLOAK_CLIENT_ID` está correto
- Verifique se o client existe no Keycloak
- Verifique se está no realm correto

### Problema: "Invalid redirect URI"

**Solução:**
- Adicione `http://localhost:3000/*` nas **Valid Redirect URIs**
- Verifique se não há espaços extras na configuração

### Problema: "CORS error"

**Solução:**
- Adicione `http://localhost:3000` nas **Web Origins**
- Verifique se o client é do tipo `public`

### Problema: "Invalid client secret"

**Solução:**
- Copie o secret correto do Keycloak
- Verifique se não há espaços extras no `.env`
- Reinicie o backend após alterar o `.env`

## 📚 Recursos Adicionais

### URLs Úteis

- **Keycloak Admin**: https://keycloak-hlg.extrata.com.br/admin
- **Realm Config**: https://keycloak-hlg.extrata.com.br/realms/extrata
- **OpenID Config**: https://keycloak-hlg.extrata.com.br/realms/extrata/.well-known/openid_configuration

### Documentação

- [Keycloak Admin REST API](https://www.keycloak.org/docs/latest/server_admin/)
- [OpenID Connect](https://openid.net/connect/)
- [OAuth2](https://oauth.net/2/)

## ✅ Checklist de Configuração

- [ ] Keycloak está acessível
- [ ] Client `academy-backend` criado e configurado
- [ ] Client `academy-frontend` criado e configurado
- [ ] Secret copiado para `.env`
- [ ] URLs de redirecionamento configuradas
- [ ] Web Origins configuradas
- [ ] Backend iniciado sem erros
- [ ] Frontend iniciado sem erros
- [ ] Login funcionando
- [ ] Token sendo armazenado

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs do backend: `cd backend && npm run start:dev`
2. Verifique os logs do frontend: `cd frontend && npm run dev`
3. Verifique o console do browser (F12)
4. Execute o teste de conectividade: `node scripts/test-keycloak-connection.js`
5. Verifique as configurações no Keycloak Admin

---

**Próximo passo**: Após configurar o Keycloak, continue com o desenvolvimento das features do LMS seguindo o roadmap em `docs/10-IMPLEMENTATION-ROADMAP.md`
