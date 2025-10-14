'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { keycloak, keycloakInitOptions } from '@/lib/keycloak-unified';
import { apiClient } from '@/lib/api';

interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  getToken: () => string | null;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only initialize on client side
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    const initAuth = async () => {
      try {
        console.log('🔐 Initializing Keycloak...');
        
        const authenticated = await keycloak.init(keycloakInitOptions);
        
        if (authenticated) {
          console.log('✅ User authenticated');
          await setupAuthenticatedUser();
        } else {
          console.log('❌ User not authenticated');
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('❌ Authentication initialization failed:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const setupAuthenticatedUser = async () => {
    try {
      // Get user info from Keycloak
      const userInfo = await keycloak.loadUserInfo();
      
      const userData: User = {
        id: keycloak.subject || '',
        email: userInfo.email || '',
        username: userInfo.preferred_username || '',
        firstName: userInfo.given_name || '',
        lastName: userInfo.family_name || '',
        roles: keycloak.realmAccess?.roles || [],
      };

      setUser(userData);
      setIsAuthenticated(true);
      
      // Set token in API client
      if (keycloak.token) {
        apiClient.setToken(keycloak.token);
      }

      console.log('✅ User setup complete:', userData.username);
    } catch (error) {
      console.error('❌ Failed to setup user:', error);
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const login = () => {
    if (typeof window !== 'undefined') {
      // Clear any cached tokens before login
      localStorage.removeItem('keycloak-token');
      localStorage.removeItem('keycloak-refresh-token');
      localStorage.removeItem('keycloak-user');
      
      // Use login without explicit redirectUri to let Keycloak handle it
      keycloak.login();
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      // Clear local state
      setUser(null);
      setIsAuthenticated(false);
      apiClient.setToken(null);
      
      // Clear any cached tokens
      localStorage.removeItem('keycloak-token');
      localStorage.removeItem('keycloak-refresh-token');
      localStorage.removeItem('keycloak-user');
      
      // Force logout with explicit redirect
      keycloak.logout({
        redirectUri: window.location.origin
      });
    }
  };

  const getToken = (): string | null => {
    return keycloak.token || null;
  };

  const hasRole = (role: string): boolean => {
    return user?.roles?.includes(role) || false;
  };

  // Setup token refresh
  useEffect(() => {
    if (isAuthenticated && keycloak.token) {
      const refreshInterval = setInterval(async () => {
        try {
          const refreshed = await keycloak.updateToken(30); // Refresh if expires in 30s
          if (refreshed) {
            console.log('🔄 Token refreshed');
            apiClient.setToken(keycloak.token);
          }
        } catch (error) {
          console.error('❌ Token refresh failed:', error);
          logout();
        }
      }, 30000); // Check every 30 seconds

      return () => clearInterval(refreshInterval);
    }
  }, [isAuthenticated]);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    getToken,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
