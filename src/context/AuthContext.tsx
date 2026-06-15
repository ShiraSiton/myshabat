'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { User, UserRole, UserStatus } from '@/lib/types';
import { mockUsers } from '@/lib/mock-data';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAdmin: boolean;
  isHost: boolean;
  isGuest: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(mockUsers[3]);

  const login = useCallback(async (email: string, password: string) => {
    const found = mockUsers.find((u) => u.email === email);
    if (!found) return { success: false, error: 'משתמש לא נמצא' };
    if (found.status !== 'active') return { success: false, error: 'החשבון לא פעיל. אנא פנה למנהל המערכת.' };
    setUser(found);
    return { success: true };
  }, []);

  const register = useCallback(async (email: string, _password: string, role: UserRole) => {
    const exists = mockUsers.find((u) => u.email === email);
    if (exists) return { success: false, error: 'כתובת האימייל כבר רשומה במערכת' };
    const newUser: User = {
      id: String(Date.now()),
      email,
      password_hash: 'hashed',
      role,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockUsers.push(newUser);
    return { success: true, error: 'נרשמת בהצלחה! החשבון ממתין לאישור מנהל.' };
  }, []);

  const logout = useCallback(() => setUser(null), []);

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isAdmin: user?.role === 'admin',
      isHost: user?.role === 'host',
      isGuest: user?.role === 'guest',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
