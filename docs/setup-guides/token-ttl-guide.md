# Guia: Aumentar Validade do Token JWT para 1 Hora

## Opção 1: Via Console do Keycloak (Recomendado)

### Passo a Passo:

1. **Acesse o Keycloak Admin Console**
   - URL: https://keycloak-hlg.extrata.com.br
   - Faça login com suas credenciais de administrador

2. **Selecione o Realm**
   - No menu superior esquerdo, selecione o realm: **extrata**

3. **Acesse Configurações do Realm**
   - No menu lateral esquerdo, clique em **Realm Settings**

4. **Vá para a aba Tokens**
   - Clique na aba **Tokens** (no topo)

5. **Ajuste os Tempos de Vida dos Tokens**

   Altere os seguintes valores:

   | Configuração | Valor Atual | Novo Valor |
   |--------------|-------------|------------|
   | **Access Token Lifespan** | 5 minutes | **60 minutes** (1 hora) |
   | **Access Token Lifespan For Implicit Flow** | 15 minutes | **60 minutes** |
   | **Client login timeout** | 5 minutes | **60 minutes** |
   | **SSO Session Idle** | 30 minutes | **60 minutes** |
   | **SSO Session Max** | 10 hours | **10 hours** (manter) |

6. **Salve as Alterações**
   - Role até o final da página
   - Clique no botão **Save**

7. **Verifique a Alteração**
   - Faça logout da aplicação
   - Faça login novamente
   - O novo token terá validade de 1 hora

---

## Opção 2: Apenas para o Client academy-frontend

Se você quiser aumentar apenas para o client específico:

1. **Acesse Clients**
   - Menu lateral → **Clients**
   - Procure e clique em **academy-frontend**

2. **Vá para Advanced Settings**
   - Role até a seção **Advanced Settings**

3. **Ajuste Access Token Lifespan**
   - Encontre: **Access Token Lifespan**
   - Altere para: **3600** (segundos = 1 hora)

4. **Salve**
   - Clique em **Save** no final da página

---

## Opção 3: Via API REST do Keycloak (Avançado)

Se tiver acesso de admin, pode fazer via API:

```bash
# 1. Obter token de admin
ADMIN_TOKEN=$(curl -s -X POST "https://keycloak-hlg.extrata.com.br/realms/master/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=ADMIN_USER" \
  -d "password=ADMIN_PASSWORD" \
  -d "grant_type=password" \
  -d "client_id=admin-cli" | jq -r .access_token)

# 2. Obter configuração atual do realm
curl -s -X GET "https://keycloak-hlg.extrata.com.br/admin/realms/extrata" \
  -H "Authorization: Bearer $ADMIN_TOKEN" > realm-config.json

# 3. Editar o arquivo realm-config.json
# Alterar: "accessTokenLifespan": 300 → "accessTokenLifespan": 3600

# 4. Atualizar o realm
curl -X PUT "https://keycloak-hlg.extrata.com.br/admin/realms/extrata" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d @realm-config.json
```

---

## ⚠️ Importante

### Considerações de Segurança:

1. **Ambiente de Desenvolvimento**: ✅ OK aumentar para 1 hora
2. **Ambiente de Produção**: ⚠️ Considerar riscos de segurança
   - Tokens de longa duração podem ser roubados
   - Maior janela de tempo para ataques
   - Recomendação: usar refresh tokens ao invés de access tokens longos

### Alternativa Melhor: Refresh Token

Ao invés de aumentar o access token, considere usar refresh tokens:

```javascript
// Frontend: Renovar token automaticamente
keycloak.updateToken(30).then((refreshed) => {
  if (refreshed) {
    console.log('Token renovado');
  }
});
```

---

## Verificar Configuração Atual

Para ver o tempo de vida atual do token:

```bash
# Decodificar o token JWT
echo "SEU_TOKEN" | cut -d. -f2 | base64 -d | jq .

# Verificar campos:
# - "iat": issued at (timestamp)
# - "exp": expiration (timestamp)
# - Diferença entre exp e iat = tempo de vida em segundos
```

---

## Após Aumentar o TTL

1. **Faça logout** da aplicação
2. **Limpe o localStorage**:
   ```javascript
   localStorage.removeItem('keycloak-token');
   localStorage.removeItem('keycloak-refresh-token');
   localStorage.removeItem('keycloak-user');
   ```
3. **Faça login novamente**
4. **Verifique o novo token**:
   ```javascript
   const token = localStorage.getItem('keycloak-token');
   const payload = JSON.parse(atob(token.split('.')[1]));
   const expiresIn = payload.exp - payload.iat;
   console.log('Token válido por:', expiresIn / 60, 'minutos');
   ```

---

## Resultado Esperado

Após configurar:
- ✅ Token válido por **60 minutos** (3600 segundos)
- ✅ Testes podem rodar sem interrupção
- ✅ Menos necessidade de renovação manual
