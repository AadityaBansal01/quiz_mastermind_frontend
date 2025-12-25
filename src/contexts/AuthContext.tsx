// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '@/utils/api';

export interface User {
  id: string;
  name: string;
  email: string;
  class: 11 | 12;
  rollNumber: string;
  role: 'student' | 'admin';
  qodStreak?: number;
  totalPoints?: number;
}

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: Omit<User, 'id'> & { password: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

 useEffect(() => {
  const initAuth = async () => {
    const token = localStorage.getItem("mathquiz_token");
    const storedUser = localStorage.getItem("mathquiz_user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    if (token) {
      try {
        const response = await authAPI.getProfile();
        if (response.data.success) {
          setUser(response.data.user);
          localStorage.setItem(
            "mathquiz_user",
            JSON.stringify(response.data.user)
          );
        }
      } catch (error) {
        console.error("Auth init failed:", error);
        localStorage.removeItem("mathquiz_token");
        localStorage.removeItem("mathquiz_user");
        setUser(null);
      }
    }

    setIsLoading(false);
  };

  initAuth();
}, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authAPI.login({ email, password });
      
      if (response.data.success) {
        const { token, user: userData } = response.data;
        localStorage.setItem('mathquiz_token', token);
        localStorage.setItem('mathquiz_user', JSON.stringify(userData));
        setUser(userData);
        return { success: true };
      }
      
      return { success: false, error: 'Login failed' };
    } catch (error: any) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Invalid email or password' 
      };
    }
  };

  const register = async (userData: Omit<User, 'id'> & { password: string }): 
  Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await authAPI.register(userData);

    if (response.data.success) {
      const { token, user: newUser } = response.data;

      localStorage.setItem("mathquiz_token", token);
      localStorage.setItem("mathquiz_user", JSON.stringify(newUser));
      setUser(newUser);

      return { success: true };
    }

    return { success: false, error: "Registration failed" };
  } catch (error: any) {
    console.error("Registration error:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Registration failed",
    };
  }
};

  const logout = () => {
   setUser(null);
  localStorage.removeItem("mathquiz_token");
  localStorage.removeItem("mathquiz_user");
  };

  return (
    <AuthContext.Provider
  value={{
    user,
    setUser,
    isLoading,
    login,
    register,
    logout,
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