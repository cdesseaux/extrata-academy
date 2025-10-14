import Keycloak from 'keycloak-js';

// Single, unified Keycloak configuration
const keycloakConfig = {
  url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'https://keycloak-hlg.extrata.com.br',
  realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'extrata',
  clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'academy-frontend',
  // Force fresh configuration
  enableLogging: process.env.NODE_ENV === 'development',
};

// Create Keycloak instance
export const keycloak = new Keycloak(keycloakConfig);

// Unified initialization options
export const keycloakInitOptions = {
  onLoad: 'check-sso',
  pkceMethod: 'S256',
  checkLoginIframe: false,
  enableLogging: process.env.NODE_ENV === 'development',
  flow: 'standard',
  responseMode: 'fragment',
  scope: 'openid profile email',
  responseType: 'code',
  timeSkew: 0,
  messageReceiveTimeout: 10000,
};

export default keycloak;
