import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, setAuthToken, getAuthToken } from '@/services/api';

export type UserRole = 'admin' | 'socio';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  cooperativeId?: string;
  rut?: string;
  lastLogin?: Date;
  status: 'active' | 'inactive';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved session
    const initAuth = async () => {
      const token = getAuthToken();
      if (token) {
        try {
          const userData = await authApi.me();
          setUser({
            id: userData.id,
            email: userData.email,
            name: userData.name,
            role: userData.role as UserRole,
            cooperativeId: userData.cooperativeId || undefined,
            status: 'active',
          });
        } catch (error) {
          // Token invalid, clear it
          console.error('Token validation failed:', error);
          setAuthToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      const response = await authApi.login({ email, password });

      // Save token
      setAuthToken(response.token);

      // Set user
      setUser({
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        role: response.user.role as UserRole,
        cooperativeId: response.user.cooperativeId || undefined,
        status: 'active',
        lastLogin: new Date(),
      });
    } catch (error) {
      setIsLoading(false);
      throw error;
    }

    setIsLoading(false);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // Ignore logout errors
    }
    setUser(null);
    setAuthToken(null);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isLoading, 
        login, 
        logout,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
