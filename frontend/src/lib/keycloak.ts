import Keycloak from 'keycloak-js';

// Configuração simplificada do Keycloak
const keycloakConfig = {
  url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'https://keycloak-hlg.extrata.com.br',
  realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'extrata',
  clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'academy-frontend',
  enableLogging: true,
  // Configurações adicionais para resolver erro 400
  checkLoginIframe: false,
  checkLoginIframeInterval: 5,
};

// Log da configuração para debug

// Instância do Keycloak
export const keycloak = new Keycloak(keycloakConfig);

// Configurações de inicialização simplificadas
export const keycloakInitOptions = {
  onLoad: 'check-sso',
  silentCheckSsoRedirectUri: typeof window !== 'undefined' ? window.location.origin + '/silent-check-sso.html' : '',
  pkceMethod: 'S256',
  checkLoginIframe: false,
  enableLogging: true,
  flow: 'standard',
  responseMode: 'fragment',
  redirectUri: typeof window !== 'undefined' ? window.location.origin : '',
  scope: 'openid profile email',
  responseType: 'code',
  // Configurações adicionais para resolver erro 400
  timeSkew: 0,
  messageReceiveTimeout: 10000,
  enableCookies: true,
  cookieName: 'keycloak-token',
  cookiePath: '/',
  cookieDomain: typeof window !== 'undefined' ? window.location.hostname : '',
  cookieSecure: typeof window !== 'undefined' ? window.location.protocol === 'https:' : false,
  cookieSameSite: 'lax',
  // Configurações específicas para resolver problema
  adapter: 'default',
  useNonce: true,
  checkLoginIframeInterval: 5,
};

export default keycloak;
