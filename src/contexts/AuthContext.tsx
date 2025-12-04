import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: Omit<User, 'id'> & { password: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users for testing
const DEMO_USERS: (User & { password: string })[] = [
  {
    id: '1',
    name: 'Student User',
    email: 'student@test.com',
    password: 'password',
    class: 11,
    rollNumber: 'STU001',
    role: 'student',
    qodStreak: 5,
    totalPoints: 250,
  },
  {
    id: '2',
    name: 'Admin User',
    email: 'admin@test.com',
    password: 'password',
    class: 12,
    rollNumber: 'ADM001',
    role: 'admin',
    qodStreak: 0,
    totalPoints: 0,
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('mathquiz_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Check demo users first
    const demoUser = DEMO_USERS.find(u => u.email === email && u.password === password);
    if (demoUser) {
      const { password: _, ...userWithoutPassword } = demoUser;
      setUser(userWithoutPassword);
      localStorage.setItem('mathquiz_user', JSON.stringify(userWithoutPassword));
      return { success: true };
    }

    // Check localStorage for registered users
    const users = JSON.parse(localStorage.getItem('mathquiz_users') || '[]');
    const foundUser = users.find((u: User & { password: string }) => u.email === email && u.password === password);
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('mathquiz_user', JSON.stringify(userWithoutPassword));
      return { success: true };
    }

    return { success: false, error: 'Invalid email or password' };
  };

  const register = async (userData: Omit<User, 'id'> & { password: string }): Promise<{ success: boolean; error?: string }> => {
    const users = JSON.parse(localStorage.getItem('mathquiz_users') || '[]');
    
    // Check if email already exists
    if (users.some((u: User) => u.email === userData.email) || DEMO_USERS.some(u => u.email === userData.email)) {
      return { success: false, error: 'Email already registered' };
    }

    const newUser = {
      ...userData,
      id: Date.now().toString(),
      qodStreak: 0,
      totalPoints: 0,
    };

    users.push(newUser);
    localStorage.setItem('mathquiz_users', JSON.stringify(users));

    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    localStorage.setItem('mathquiz_user', JSON.stringify(userWithoutPassword));

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mathquiz_user');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
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
