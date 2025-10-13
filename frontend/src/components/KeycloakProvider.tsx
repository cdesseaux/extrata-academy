'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { keycloak, keycloakInitOptions } from '@/lib/keycloak';
import { keycloakAlternative, keycloakAlternativeInitOptions } from '@/lib/keycloak-alternative';
import { keycloakSimple, keycloakSimpleInitOptions } from '@/lib/keycloak-simple';
import { apiClient } from '@/lib/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  hasRole: (role: string) => boolean;
  getToken: () => string | undefined;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentKeycloakInstance, setCurrentKeycloakInstance] = useState<any>(null);

  useEffect(() => {
    // Só inicializa no cliente
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    const initKeycloak = async () => {
      // Primeiro, verifica se há dados salvos no localStorage
      if (typeof window !== 'undefined') {
        const savedToken = localStorage.getItem('keycloak-token');
        const savedUser = localStorage.getItem('keycloak-user');

        if (savedToken && savedUser) {

          // Verifica se o token não está expirado
          try {
            const tokenParts = savedToken.split('.');
            if (tokenParts.length === 3) {
              const payload = JSON.parse(atob(tokenParts[1]));
              const expirationTime = payload.exp * 1000; // Converte para ms
              const now = Date.now();

              if (expirationTime < now) {
                localStorage.removeItem('keycloak-token');
                localStorage.removeItem('keycloak-refresh-token');
                localStorage.removeItem('keycloak-user');
                // Não retorna aqui, continua para inicializar o Keycloak normalmente
              } else {
                const userData = JSON.parse(savedUser);
                setUser(userData);
                setIsAuthenticated(true);
                apiClient.setToken(savedToken);
                setIsLoading(false);
                return;
              }
            }
          } catch (error) {
            console.error('Erro ao verificar/restaurar sessão:', error);
            // Limpa dados inválidos
            localStorage.removeItem('keycloak-token');
            localStorage.removeItem('keycloak-refresh-token');
            localStorage.removeItem('keycloak-user');
          }
        }
      }
      
      let currentKeycloak = keycloak;
      let currentOptions = keycloakInitOptions;
      
      try {
        
        const authenticated = await keycloakSimple.init(keycloakSimpleInitOptions);
        if (authenticated) {
          await setupAuthenticatedUser(keycloakSimple);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        
        try {
          currentKeycloak = keycloak;
          currentOptions = keycloakInitOptions;
          
          const authenticated = await keycloak.init(keycloakInitOptions);
          if (authenticated) {
            await setupAuthenticatedUser(keycloak);
          } else {
            setIsAuthenticated(false);
            setUser(null);
          }
        } catch (completeError) {
          
          try {
            currentKeycloak = keycloakAlternative;
            currentOptions = keycloakAlternativeInitOptions;
            
            const authenticated = await keycloakAlternative.init(keycloakAlternativeInitOptions);
            if (authenticated) {
              await setupAuthenticatedUser(keycloakAlternative);
            } else {
              setIsAuthenticated(false);
              setUser(null);
            }
          } catch (alternativeError) {
            
            setIsAuthenticated(false);
            setUser(null);
            
            // Última tentativa: login direto
            try {
              keycloakSimple.login();
            } catch (loginError) {
              try {
                keycloak.login();
              } catch (loginError2) {
                keycloakAlternative.login();
              }
            }
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    const setupAuthenticatedUser = async (kc: any) => {
      
      setCurrentKeycloakInstance(kc);
      setIsAuthenticated(true);
      setUser({
        id: kc.subject || '',
        email: kc.tokenParsed?.email || '',
        firstName: kc.tokenParsed?.given_name || '',
        lastName: kc.tokenParsed?.family_name || '',
        username: kc.tokenParsed?.preferred_username || '',
        roles: kc.tokenParsed?.realm_access?.roles || [],
      });
      
      // Configurar token no cliente API
      apiClient.setToken(kc.token || null);
      
      // Salvar token no localStorage para persistência
      if (typeof window !== 'undefined') {
        localStorage.setItem('keycloak-token', kc.token || '');
        localStorage.setItem('keycloak-refresh-token', kc.refreshToken || '');
        localStorage.setItem('keycloak-user', JSON.stringify({
          id: kc.subject || '',
          email: kc.tokenParsed?.email || '',
          firstName: kc.tokenParsed?.given_name || '',
          lastName: kc.tokenParsed?.family_name || '',
          username: kc.tokenParsed?.preferred_username || '',
          roles: kc.tokenParsed?.realm_access?.roles || [],
        }));
      }
      
      // Configurar refresh automático do token
      kc.onTokenExpired = () => {
        
        kc.updateToken(30).then((refreshed: boolean) => {
          if (refreshed) {
            apiClient.setToken(kc.token || null);
            // Atualizar localStorage
            if (typeof window !== 'undefined') {
              localStorage.setItem('keycloak-token', kc.token || '');
              localStorage.setItem('keycloak-refresh-token', kc.refreshToken || '');
            }
          } else {
            kc.login();
          }
        }).catch((error: any) => {
          kc.login();
        });
      };
    };

    initKeycloak();
    
    // Listener para mudanças de autenticação (ambas as instâncias)
    const setupListeners = (kc: any) => {
      kc.onAuthSuccess = () => {
        setIsAuthenticated(true);
      };

      kc.onAuthError = () => {
        setIsAuthenticated(false);
        setUser(null);
        // Limpa localStorage em caso de erro
        if (typeof window !== 'undefined') {
          localStorage.removeItem('keycloak-token');
          localStorage.removeItem('keycloak-refresh-token');
          localStorage.removeItem('keycloak-user');
        }
      };

      kc.onAuthLogout = () => {
        setIsAuthenticated(false);
        setUser(null);
        setCurrentKeycloakInstance(null);
        apiClient.setToken(null);
        // Limpa localStorage no logout
        if (typeof window !== 'undefined') {
          localStorage.removeItem('keycloak-token');
          localStorage.removeItem('keycloak-refresh-token');
          localStorage.removeItem('keycloak-user');
        }
      };
    };

    setupListeners(keycloak);
    setupListeners(keycloakAlternative);
    setupListeners(keycloakSimple);
  }, []);

  const login = () => {
    if (typeof window !== 'undefined') {
      // Força limpeza completa antes do login
      localStorage.removeItem('keycloak-token');
      localStorage.removeItem('keycloak-refresh-token');
      localStorage.removeItem('keycloak-user');
      localStorage.removeItem('keycloak-token-simple');
      
      // Limpa estado local
      setIsAuthenticated(false);
      setUser(null);
      setCurrentKeycloakInstance(null);
      apiClient.setToken(null);
      
      // Redireciona para login do Keycloak diretamente
      window.location.href = `${process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'https://keycloak-hlg.extrata.com.br'}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'extrata'}/protocol/openid-connect/auth?client_id=${process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'academy-frontend'}&redirect_uri=${encodeURIComponent(window.location.origin)}&response_type=code&scope=openid%20profile%20email`;
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      // Limpa dados do localStorage
      localStorage.removeItem('keycloak-token');
      localStorage.removeItem('keycloak-refresh-token');
      localStorage.removeItem('keycloak-user');
      localStorage.removeItem('keycloak-token-simple');
      
      // Limpa estado local
      setIsAuthenticated(false);
      setUser(null);
      setCurrentKeycloakInstance(null);
      apiClient.setToken(null);
      
      // Tenta logout com todas as instâncias
      try {
        if (currentKeycloakInstance) {
          currentKeycloakInstance.logout({
            redirectUri: window.location.origin,
          });
        } else {
          // Tenta com todas as instâncias
          try {
            keycloakSimple.logout({
              redirectUri: window.location.origin,
            });
          } catch (error) {
            try {
              keycloak.logout({
                redirectUri: window.location.origin,
              });
            } catch (error2) {
              keycloakAlternative.logout({
                redirectUri: window.location.origin,
              });
            }
          }
        }
      } catch (error) {
        // Se falhar, pelo menos limpa o estado local
        console.error('Erro durante logout:', error);
      }
    }
  };

  const hasRole = (role: string): boolean => {
    if (!user) return false;
    return user.roles.includes(role);
  };

  const getToken = (): string | undefined => {
    
    // Primeiro tenta da instância atual
    if (currentKeycloakInstance && currentKeycloakInstance.token) {
      return currentKeycloakInstance.token;
    }
    
    // Se não tiver, tenta do localStorage
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('keycloak-token') || localStorage.getItem('keycloak-token-simple');
      if (savedToken) {
        return savedToken;
      }
    }
    
    // Tenta de todas as instâncias
    if (keycloakSimple.token) return keycloakSimple.token;
    if (keycloak.token) return keycloak.token;
    if (keycloakAlternative.token) return keycloakAlternative.token;
    
    return undefined;
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    hasRole,
    getToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
