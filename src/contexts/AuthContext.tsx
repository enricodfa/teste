'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { getStatus } from '../services/plansService';

interface AuthContextType {
  user:         User | null;
  session:      Session | null;
  loading:      boolean;
  isPremium:    boolean;
  /** Raw status from the backend: 'active' | 'canceled' | 'inactive' | null (while loading) */
  planStatus:   string | null;
  planLoading:  boolean;
  signInWithGoogle: () => Promise<void>;
  signOut:          () => Promise<void>;
  /** Recarrega o status do plano do backend */
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
  
  // Track if initial auth check is complete
  const authInitialized = useRef(false);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        authInitialized.current = true;
        
        // If no user, we're done loading
        if (!session?.user) {
          setLoading(false);
          setPlanLoading(false);
        } else {
          setLoading(false);
          // Plan will be fetched by the other useEffect
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
          setPlanLoading(false);
        }
      }
    }

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      
      // If user logs out, reset plan state
      if (!session?.user) {
        setIsPremium(false);
        setPlanStatus(null);
        setPlanLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Fetch plan status when user changes (and is not null)
  useEffect(() => {
    let mounted = true;

    async function fetchPlan() {
      // Only fetch if we have a user and auth is initialized
      if (!user || !authInitialized.current) {
        return;
      }

      setPlanLoading(true);
      try {
        const data = await getStatus();
        if (mounted) {
          setIsPremium(data.is_premium);
          setPlanStatus(data.status);
        }
      } catch (error) {
        console.error('Error fetching plan status:', error);
        if (mounted) {
          setIsPremium(false);
          setPlanStatus(null);
        }
      } finally {
        if (mounted) {
          setPlanLoading(false);
        }
      }
    }

    fetchPlan();

    return () => {
      mounted = false;
    };
  }, [user?.id]); // Use user.id instead of user object to avoid unnecessary re-fetches

  // Public function to refresh plan status
  const refreshPlanStatus = useCallback(async () => {
    if (!user) return;
    
    setPlanLoading(true);
    try {
      const data = await getStatus();
      setIsPremium(data.is_premium);
      setPlanStatus(data.status);
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
      refreshPlanStatus 
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