import Keycloak from 'keycloak-js';

// Configuração alternativa mais simples para Keycloak sem .well-known
const createKeycloakConfig = () => {
  const config = {
    url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'https://keycloak-hlg.extrata.com.br',
    realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'extrata',
    clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'academy-frontend',
    // Configuração mínima
    authServerUrl: process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'https://keycloak-hlg.extrata.com.br',
    // Desabilita descoberta automática
    checkLoginIframe: false,
    enableLogging: true,
  };
  
  // Log da configuração para debug
  return config;
};

// Instância alternativa do Keycloak
export const keycloakAlternative = new Keycloak(createKeycloakConfig());

// Configurações de inicialização mais simples
export const keycloakAlternativeInitOptions = {
  onLoad: 'check-sso', // Verifica SSO silenciosamente
  pkceMethod: 'S256',
  checkLoginIframe: false,
  enableLogging: true,
  flow: 'standard',
  responseMode: 'fragment',
  timeSkew: 0,
  // Configurações mínimas
  scope: 'openid profile email',
  responseType: 'code',
  redirectUri: typeof window !== 'undefined' ? window.location.origin : '',
  // Configurações de persistência
  adapter: 'default',
  enableCookies: true,
  cookieName: 'keycloak-token-alt',
  cookiePath: '/',
  cookieDomain: typeof window !== 'undefined' ? window.location.hostname : '',
  cookieSecure: typeof window !== 'undefined' ? window.location.protocol === 'https:' : false,
  cookieSameSite: 'lax',
};

export default keycloakAlternative;
