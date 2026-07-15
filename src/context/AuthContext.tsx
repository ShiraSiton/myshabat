'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, UserRole } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isHost: boolean;
  isGuest: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) fetchUser(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) fetchUser(session.user.id);
      else { setUser(null); setLoading(false); }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUser = async (authId: string) => {
    const { data } = await supabase.from('users').select('*').eq('id', authId).single();
    if (data) setUser(data as User);
    setLoading(false);
  };

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }, []);

  const register = useCallback(async (email: string, password: string, role: UserRole) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
    if (authError) return { success: false, error: authError.message };
    if (!authData.user) return { success: false, error: 'שגיאה ביצירת המשתמש' };

    const { error: dbError } = await supabase.from('users').insert({
      id: authData.user.id,
      email,
      role,
      status: 'pending',
    });
    if (dbError) return { success: false, error: dbError.message };
    return { success: true, error: 'נרשמת בהצלחה! החשבון ממתין לאישור מנהל.' };
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user, loading,
      login, register, logout,
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
