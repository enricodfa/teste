'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { getMe } from '../services/authService';

interface AuthContextType {
  user:         User | null;
  session:      Session | null;
  loading:      boolean;
  isPremium:    boolean;
  planStatus:   string | null;
  planLoading:  boolean;
  signInWithGoogle: () => Promise<void>;
  signOut:          () => Promise<void>;
  refreshPlanStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,        setUser]        = useState<User | null>(null);
  const [session,     setSession]     = useState<Session | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [isPremium,   setIsPremium]   = useState(false);
  const [planStatus,  setPlanStatus]  = useState<string | null>(null);
  const [planLoading, setPlanLoading] = useState(true);

  const authInitialized = useRef(false);

  async function fetchPlanForUser(mounted: () => boolean) {
    try {
      const data = await getMe();
      if (!mounted()) return;
      setIsPremium(data.subscription.is_premium);
      setPlanStatus(data.subscription.status);
    } catch (error) {
      console.error('Error fetching auth data (getMe):', error);
      if (!mounted()) return;
      setIsPremium(false);
      setPlanStatus(null);
    } finally {
      if (mounted()) setPlanLoading(false);
    }
  }

  useEffect(() => {
    let alive = true;
    const mounted = () => alive;

    async function initAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!mounted()) return;

        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        authInitialized.current = true;

        if (session?.user) {
          await fetchPlanForUser(mounted);
        } else {
          setPlanLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted()) {
          setLoading(false);
          setPlanLoading(false);
        }
      }
    }

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted()) return;
      setSession(session);
      setUser(session?.user ?? null);

      if (!session?.user) {
        setIsPremium(false);
        setPlanStatus(null);
        setPlanLoading(false);
      }
    });

    return () => {
      alive = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!authInitialized.current || !user) return;

    let alive = true;
    const mounted = () => alive;

    setPlanLoading(true);
    fetchPlanForUser(mounted);

    return () => { alive = false; };
  }, [user?.id]);

  const refreshPlanStatus = useCallback(async () => {
    if (!user) return;

    setPlanLoading(true);
    try {
      const data = await getMe();
      setIsPremium(data.subscription.is_premium);
      setPlanStatus(data.subscription.status);
    } catch (error) {
      console.error('Error refreshing plan status:', error);
      setIsPremium(false);
      setPlanStatus(null);
    } finally {
      setPlanLoading(false);
    }
  }, [user]);

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      isPremium,
      planStatus,
      planLoading,
      signInWithGoogle,
      signOut,
      refreshPlanStatus,
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