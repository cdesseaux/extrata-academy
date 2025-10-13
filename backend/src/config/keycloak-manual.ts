/**
 * Configuração manual do Keycloak para o Extrata Academy
 * Usado quando o OpenID Connect não está habilitado no realm
 */

export const keycloakConfig = {
  realm: 'extrata',
  url: 'https://keycloak-hlg.extrata.com.br',
  clientId: 'academy-backend',
  clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || 'your-secret-here',
  
  // Endpoints manuais (baseados na estrutura padrão do Keycloak)
  authorizationEndpoint: 'https://keycloak-hlg.extrata.com.br/realms/extrata/protocol/openid-connect/auth',
  tokenEndpoint: 'https://keycloak-hlg.extrata.com.br/realms/extrata/protocol/openid-connect/token',
  userInfoEndpoint: 'https://keycloak-hlg.extrata.com.br/realms/extrata/protocol/openid-connect/userinfo',
  jwksUri: 'https://keycloak-hlg.extrata.com.br/realms/extrata/protocol/openid-connect/certs',
  logoutEndpoint: 'https://keycloak-hlg.extrata.com.br/realms/extrata/protocol/openid-connect/logout',
  
  // URLs de callback
  callbackURL: process.env.FRONTEND_URL + '/auth/callback',
  logoutCallbackURL: process.env.FRONTEND_URL + '/auth/logout',
  
  // Configurações de token
  tokenLifespan: 15 * 60 * 1000, // 15 minutos
  refreshTokenLifespan: 7 * 24 * 60 * 60 * 1000, // 7 dias
};

export const frontendKeycloakConfig = {
  realm: 'extrata',
  url: 'https://keycloak-hlg.extrata.com.br',
  clientId: 'academy-frontend',
  
  // URLs públicas (acessíveis do browser)
  authorizationEndpoint: 'https://keycloak-hlg.extrata.com.br/realms/extrata/protocol/openid-connect/auth',
  tokenEndpoint: 'https://keycloak-hlg.extrata.com.br/realms/extrata/protocol/openid-connect/token',
  userInfoEndpoint: 'https://keycloak-hlg.extrata.com.br/realms/extrata/protocol/openid-connect/userinfo',
  jwksUri: 'https://keycloak-hlg.extrata.com.br/realms/extrata/protocol/openid-connect/certs',
  logoutEndpoint: 'https://keycloak-hlg.extrata.com.br/realms/extrata/protocol/openid-connect/logout',
  
  // URLs de callback
  callbackURL: process.env.FRONTEND_URL + '/auth/callback',
  logoutCallbackURL: process.env.FRONTEND_URL + '/auth/logout',
};


