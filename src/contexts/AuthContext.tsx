import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { currentUser } from '@/data/mockData';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  /** True when using mock data (Supabase not configured) */
  isMockMode: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, meta: { handle: string; displayName: string }) => Promise<{ error: string | null; needsEmailConfirmation?: boolean }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // If Supabase isn't configured, run in mock mode — skip auth entirely
  const isMockMode = !isSupabaseConfigured;

  useEffect(() => {
    if (isMockMode) {
      // In mock mode, simulate an authenticated user
      setUser({ id: currentUser.id } as unknown as User);
      setSession({} as Session);
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [isMockMode]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (
        isMockMode ||
        (email.toLowerCase() === 'demo@frame.community' && (password === 'demo123' || password === 'demo'))
      ) {
        setUser({
          id: currentUser.id,
          email: 'demo@frame.community',
          user_metadata: {
            handle: currentUser.handle,
            display_name: currentUser.displayName,
          },
        } as unknown as User);
        setSession({
          user: { id: currentUser.id, email: 'demo@frame.community' } as any,
          access_token: 'demo-token',
        } as Session);
        return { error: null };
      }

      try {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error: error?.message ?? null };
      } catch (err: any) {
        return { error: err?.message || 'Authentication request failed' };
      }
    },
    [isMockMode]
  );

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      meta: { handle: string; displayName: string }
    ) => {
      if (isMockMode) {
        setUser({ id: currentUser.id } as unknown as User);
        setSession({} as Session);
        return { error: null, needsEmailConfirmation: false };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            handle: meta.handle,
            display_name: meta.displayName,
          },
        },
      });

      if (data?.session) {
        setSession(data.session);
        setUser(data.user);
      }

      return {
        error: error?.message ?? null,
        needsEmailConfirmation: !data?.session && !!data?.user,
      };
    },
    [isMockMode]
  );

  const signOut = useCallback(async () => {
    if (isMockMode) {
      // In mock mode we don't actually sign out — just no-op
      return;
    }
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }, [isMockMode]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAuthenticated: !!session,
        isMockMode,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
