import React, { useState, useEffect, createContext, useContext } from 'react';
import { signup, signin } from '../api/auth.ts';
import type { User, AuthResponse } from '../types/user.ts';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  signup: (username: string, email: string, password: string) => Promise<void>;
  signin: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
      }
    }
  }, []);

  const handleSignup = async (username: string, email: string, password: string) => {
    const response: AuthResponse = await signup(username, email, password);
    if (response.message !== 'You are signed up !') {
      throw new Error(response.message);
    }
  };

  const handleSignin = async (username: string, password: string) => {
    const response: AuthResponse = await signin(username, password);
    if (response.token) {
      const user: User = {
        _id: '',
        username,
        email: '',
        createdAt: new Date(),
      };
      setUser(user);
      setToken(response.token);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      throw new Error(response.message || 'Login failed');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return React.createElement(
    AuthContext.Provider,
    { value: { user, token, signup: handleSignup, signin: handleSignin, logout } },
    children
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};