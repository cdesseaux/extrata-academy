import Keycloak from 'keycloak-js';

// Configuração simplificada do Keycloak - versão mais simples
const keycloakConfig = {
  url: 'https://keycloak-hlg.extrata.com.br',
  realm: 'extrata',
  clientId: 'academy-frontend',
  enableLogging: true,
};

// Instância do Keycloak
export const keycloakSimple = new Keycloak(keycloakConfig);

// Configurações de inicialização mais simples - sem iframe
export const keycloakSimpleInitOptions = {
  onLoad: 'login-required', // Força login em vez de check-sso
  pkceMethod: 'S256',
  checkLoginIframe: false, // Desabilita iframe completamente
  enableLogging: true,
  flow: 'standard',
  responseMode: 'fragment',
  redirectUri: typeof window !== 'undefined' ? window.location.origin : '',
  scope: 'openid profile email',
  responseType: 'code',
  // Configurações mínimas
  timeSkew: 0,
  messageReceiveTimeout: 10000,
};

// Log da configuração

export default keycloakSimple;
